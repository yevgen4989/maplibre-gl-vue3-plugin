import {
	createCommentVNode,
	createTextVNode,
	defineComponent,
	h,
	inject,
	onBeforeUnmount,
	PropType,
	ref,
	renderSlot,
	Teleport,
	watch
} from 'vue';
import {Position, PositionValue, PositionValues, usePositionWatcher} from '@/components/controls/shared';
import {emitterSymbol, isLoadedSymbol, LangSwitchItem, mapSymbol} from '@/components/types';
import {CustomControl} from '@/components/controls/custom.control';
import {ButtonType, default as MglButton} from '@/components/button.component';
import {mdiEarth} from '@mdi/js';
import CountryFlag from 'vue-country-flag-next';
import {getCookie, setCookie} from 'typescript-cookie'
import maplibregl from "maplibre-gl";

function isEvent(e: any): e is Event {
	return e && !!(e as Event).stopPropagation;
}

export default defineComponent({
	name: 'MglLangSwitchControl',
	props: {
		apiKey: {
			type: String as PropType<String>,
			required: true,
			default: ''
		},
		position: {
			type: String as PropType<PositionValue>,
			validator: (v: Position) => {
				return PositionValues.indexOf(v) !== -1;
			}
		},
		mapLangs: {
			type: Array as PropType<LangSwitchItem[]>,
			required: true,
			default: []
		},
		modelValue: {
			type: Object as PropType<LangSwitchItem>
		},
		isOpen: {
			type: Boolean as PropType<boolean>,
			default: undefined
		}
	},
	emits: ['update:modelValue', 'update:isOpen'],
	setup(props, ctx) {

		const map = inject(mapSymbol)!,
			isMapLoaded = inject(isLoadedSymbol)!,
			emitter = inject(emitterSymbol)!,
			isAdded = ref(false),
			isOpen = ref(props.isOpen === undefined ? false : props.isOpen),
			modelValue = ref(
				props.modelValue === undefined ?
					(
						getCookie('lang_map') ? props.mapLangs.find(o => o.lang == getCookie('lang_map')) : null
					)
					: props.modelValue
			),
			control = new CustomControl(isAdded, false),
			closer = toggleOpen.bind(null, false);

		async function getUserLocationByIP() {
			const response = await fetch(`https://api.maptiler.com/geolocation/ip.json?key=${props.apiKey}`);
			return await response.json();
		}

		function getLanguageByCountryAndRegion(country_code: string, region_code: string) {
			if (country_code === "ES") { //Spain
				if (region_code === "CT") { //Catalonia
					return "ca";
				} else {
					return "es";
				}
			} else if (country_code === "CZ") { //Czechia
				return "cs";
			} else if (country_code === "FR") { //France
				return "fr";
			} else if (country_code === "DE") { //Germany
				return "de";
			} else if (country_code === "JP") { //Japan
				return "ja";
			} else if (country_code === "UA") { //Ukraine
				return "uk";
			} else if (country_code === "US" || country_code === "GB") { //United States of America or Great Britain
				return "en";
			} else if (country_code === "EG") { //Egypt
				return "ar";
			} else {
				return "latin"
			}
		}

		async function getLangCodeByIp() {
			const geolocationIP = await getUserLocationByIP();
			const {country_code, region_code} = geolocationIP;
			return getLanguageByCountryAndRegion(country_code, region_code);
		}


		async function setLangByCookie() {
			let langCookie = getCookie('lang_map');
			if (langCookie == undefined) {
				changeLangMap(await getLangCodeByIp());

			} else {
				changeLangMap(langCookie);
			}
		}

		function changeLangMap(code: string) {
			if (map.value.getStyle().layers != null) {
				map.value.getStyle().layers!.forEach(function (thisLayer) {
					if(thisLayer.type == 'symbol'){
						var layout : maplibregl.SymbolLayout | undefined = thisLayer.layout;
						var textField : string | maplibregl.StyleFunction | [("array" | "boolean" | "collator" | "format" | "literal" | "number" | "object" | "string" | "image" | "to-boolean" | "to-color" | "to-number" | "to-string" | "typeof" | "feature-state" | "geometry-type" | "id" | "line-progress" | "properties" | "at" | "get" | "has" | "in" | "index-of" | "length" | "slice" | "!" | "!=" | "<" | "<=" | "==" | ">" | ">=" | "all" | "any" | "case" | "match" | "coalesce" | "interpolate" | "interpolate-hcl" | "interpolate-lab" | "step" | "let" | "var" | "concat" | "downcase" | "is-supported-script" | "resolved-locale" | "upcase" | "rgb" | "rgba" | "-" | "*" | "/" | "%" | "^" | "+" | "abs" | "acos" | "asin" | "atan" | "ceil" | "cos" | "e" | "floor" | "ln" | "ln2" | "log10" | "log2" | "max" | "min" | "pi" | "round" | "sin" | "sqrt" | "tan" | "zoom" | "heatmap-density"), ...any[]] | undefined = layout?.["text-field"];

						if (typeof textField == "object") {
							// @ts-ignore
							var fff : Array<string> = textField;

							if (fff[0] == 'concat') {
								map.value.setLayoutProperty(thisLayer.id, 'text-field', [
									'concat',
									['get', 'name:' + code],
									"\n",
									['get', 'name: nonlatin'],
								]);
							}
							else if(fff[0] == 'get'){
								map.value.setLayoutProperty(thisLayer.id, 'text-field', ['get', 'name:' + code]);
							}

						}
						else if (typeof layout?.["text-field"] == "string") {
							if (layout["text-field"].toString().includes('name:')) {
								map.value.setLayoutProperty(thisLayer.id, 'text-field', ['get', 'name:' + code]);
							}
						}
					}
				});
			}
		}

		watch(isMapLoaded, (v) => {
			if (v) setLangByCookie();
		}, {immediate: true});

		map.value.on('style.load', setLangByCookie);

		document.addEventListener('click', closer);

		usePositionWatcher(() => props.position, map, control);

		if (props.modelValue !== undefined) {
			watch(() => props.modelValue, v => {
				if (v !== undefined) modelValue.value = v;
			});
		}
		if (props.isOpen !== undefined) {
			watch(() => props.isOpen, v => {
				if (v !== undefined) isOpen.value = v;
			});
		}

		onBeforeUnmount(() => {
			map.value.removeControl(control);
			map.value.off('load', setLangByCookie);
			document.removeEventListener('click', closer);
		});

		function setLang(s: LangSwitchItem) {
			if (modelValue.value?.lang === s.lang) {
				return;
			}
			emitter.emit('langSwitched', s);
			changeLangMap(s.lang);
			setCookie('lang_map', s.lang, {expires: 180})
			ctx.emit('update:modelValue', s);

			toggleOpen(false);
		}

		function toggleOpen(forceIsOpen?: boolean | Event, e?: Event) {
			if (isEvent(e)) {
				e.stopPropagation();
			} else if (isEvent(forceIsOpen)) {
				forceIsOpen.stopPropagation();
			}
			if (props.isOpen !== undefined && props.isOpen === forceIsOpen || isOpen.value === forceIsOpen) {
				return;
			}
			if (props.isOpen === undefined) {
				isOpen.value = typeof forceIsOpen === 'boolean' ? forceIsOpen : !isOpen.value;
				ctx.emit('update:isOpen', isOpen.value);
			} else {
				ctx.emit('update:isOpen', typeof forceIsOpen === 'boolean' ? forceIsOpen : !props.isOpen);
			}
		}

		return {isAdded, container: control.container, setLang, toggleOpen, intIsOpen: isOpen, intModelValue: modelValue};

	},
	// just only for code assist
	template: `
		<div class="maplibregl-ctrl maplibregl-ctrl-group">
		<slot>
			<slot name="button">
				<button type="button" class="maplibregl-ctrl-icon maplibregl-style-switch"></button>
			</slot>
			<slot name="styleList">
				<div class="maplibregl-style-list" style="display: none;">
					<button type="button" class="Dark" data-uri="&quot;mapbox://styles/mapbox/dark-v10&quot;">Dark</button>
					<button type="button" class="Light" data-uri="&quot;mapbox://styles/mapbox/light-v10&quot;">Light</button>
					<button type="button" class="Outdoors" data-uri="&quot;mapbox://styles/mapbox/outdoors-v11&quot;">Outdoors</button>
					<button type="button" class="Satellite" data-uri="&quot;mapbox://styles/mapbox/satellite-streets-v11&quot;">Satellite</button>
					<button type="button" class="Streets active" data-uri="&quot;mapbox://styles/mapbox/streets-v11&quot;">Streets</button>
				</div>
			</slot>
		</slot>
		</div>
	`,

	render() {
		if (!this.isAdded) {
			return createCommentVNode('style-switch-control');
		}
		const slotProps = {
			isOpen: this.intIsOpen,
			currentLang: this.intModelValue,
			toggleOpen: this.toggleOpen,
			setLang: this.setLang
		};

		return h(
			Teleport as any,
			{to: this.container},
			renderSlot(this.$slots, 'default', slotProps, () => [

				renderSlot(this.$slots, 'button', slotProps, () => [h(MglButton, {
					type: ButtonType.MDI,
					path: mdiEarth,
					'class': ['maplibregl-ctrl-icon maplibregl-style-switch', this.intIsOpen ? 'is-open' : ''],
					onClick: this.toggleOpen.bind(null, true)
				})]),

				renderSlot(this.$slots, 'styleList', slotProps, () => [
					h('div',
						{'class': ['maplibregl-style-list', this.intIsOpen ? 'is-open' : '']},
						this.mapLangs.map((s) => {
							return s.icon
								? h(MglButton,
									{
										type: ButtonType.TEXT, onClick: () => this.setLang(s)
									},
									() => h(CountryFlag, {country: s.icon?.path, size: 'small'}, () => [])
								)
								: h(
									'button',
									{
										type: 'button',
										onClick: () => this.setLang(s)
									},
									createTextVNode(s.lang)
								);
						})
					)
				])
			])
		);
	}
});
