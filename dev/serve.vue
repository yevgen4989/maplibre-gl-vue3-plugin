<template>
	<div>
		<div class="map-container">
			<mgl-map
				v-if="showMap"
				ref="map"
				style="margin-bottom: 20px"
				:center="center"
				:zoom="zoom"
				:attribution-control="false"
				@map:load="onLoad"
				@map:zoomstart="isZooming = true"
				@map:zoomend="isZooming = false"
			>

				<mgl-fullscreen-control/>
				<mgl-attribution-control/>
				<mgl-navigation-control/>
				<mgl-scale-control/>
				<mgl-geolocation-control/>
				<mgl-style-switch-control :map-styles="mapStyles" :position="controlPosition"/>
				<mgl-lang-switch-control :map-langs="mapLangs" :position="langPosition"/>


				<div id="sidebar" class="sidebar flex-center right collapsed">
					<div class="sidebar-content rounded-rect">
						<div class="sidebar-header">
							<p class="title"></p>

							<div class="btn-close" v-on:click="closeToggle">
								<mdi-icon :path="closeIcon" style="color: black"></mdi-icon>
							</div>
						</div>
						<div class="list-provider"></div>
					</div>
				</div>
			</mgl-map>
		</div>

		<div style="display: none">
			<div>
				<input type="radio" id="one" value="top-left" v-model="controlPosition"/>
				<label for="one">top-left</label>
				<br/>
				<input type="radio" id="tw0" value="top-right" v-model="controlPosition"/>
				<label for="tw0">top-right</label>
				<br/>
				<input type="radio" id="three" value="bottom-left" v-model="controlPosition"/>
				<label for="three">bottom-left</label>
				<br/>
				<input type="radio" id="four" value="bottom-right" v-model="controlPosition"/>
				<label for="four">bottom-right</label>
				<br/>
				<span>Attribution Position: {{ controlPosition }}</span>
			</div>
			<div>
				<input type="checkbox" v-model="useClasses" id="noclasses">
				<label for="noclasses">Use Custom Control Classes</label>
			</div>
			<div>
				<input type="checkbox" v-model="showCustomControl" id="showcustom">
				<label for="showcustom">Show Custom Control</label>
			</div>
			<div>
				<input type="checkbox" v-model="showMap" id="showmap">
				<label for="showmap">Show Map</label>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent, ref, toRef, watch} from 'vue';
import {LangSwitchItem, MglDefaults, MglEvent, StyleSwitchItem, useMap} from '@/entry.esm';
import {mdiBrightness1, mdiClipboardText, mdiClose, mdiCursorDefaultClick} from '@mdi/js';
import {MapLayerMouseEvent, Marker, setRTLTextPlugin} from 'maplibre-gl';
import MglButton from "@/components/button.component";
import MdiIcon from "@/components/icon.component";
import CountryFlag from 'vue-country-flag-next';
import MglLangSwitchControl from "../src/components/controls/langSwitch.control";
import MglCustomControl from "../src/components/controls/custom.control";

const apiKey = 'pyPRAcHGtcEsPfkcQtpI';

	setRTLTextPlugin(
		'https://cdn.maptiler.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
		() => [],
		true
	);

	MglDefaults.style = `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`;
	console.log('MglDefaults', MglDefaults);

	export default defineComponent({
		name: 'ServeDev',
		components: {
			MglCustomControl,
			MglLangSwitchControl,
			MglButton,
			MdiIcon,
			CountryFlag
		},
		setup() {
			const map = useMap(),
		  	showCustomControl = ref(false);

			watch(toRef(map, 'isLoaded'), () => (console.log('IS LOADED', map)), { immediate: true });
			watch(toRef(map, 'isMounted'), (v: any) => (console.log('IS MOUNTED', v)), { immediate: true });

			return {
				showCustomControl,
				loaded           : ref(0),
				isZooming        : false,
				controlPosition  : ref('bottom-right'),
				langPosition  	 : ref('bottom-right'),
				showMap          : ref(true),
				center           : [ 35.38291369885184, 46.84996581412122 ],
				zoom             : 12,
				useClasses       : true,
				mapStyles        : [
					{ name : 'Streets', label: 'Streets', style: `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`},
					{ name: 'Basic', label: 'Basic', style: `https://api.maptiler.com/maps/basic/style.json?key=${apiKey}` },
					{ name: 'Bright', label: 'Bright', style: `https://api.maptiler.com/maps/bright/style.json?key=${apiKey}` },
					{ name: 'Satellite', label: 'Satellite', style: `https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}` },
					{ name: 'Voyager', label: 'Voyager', style: `https://api.maptiler.com/maps/voyager/style.json?key=${apiKey}` }
				] as StyleSwitchItem[],
				mapLangs         : [
					{
						icon: {
							path: 'ru'
						},
						lang: 'ru'
					},
					{
						icon: {
							path: 'ua'
						},
						lang: 'uk'
					},
					{
						icon: {
							path: 'gb'
						},
						lang: 'en'
					},
				] as LangSwitchItem[],
				buttonIcon       : mdiCursorDefaultClick,
				clipboardIcon	 : mdiClipboardText,
				closeIcon		 : mdiClose,
				circleIcon 		 : mdiBrightness1
			};
		},
		methods: {
			onLoad(e: MglEvent) {
				this.loaded++;
				//this.toggleSidebar('f');
				console.log(e.type, e);
			},
			onMouseenter(e: MapLayerMouseEvent) {
				console.log('EVENT', e.type, e.lngLat);
			},


			getCurrentLangMap(){
				const map = useMap().map!;
				var propertyArray = map.getLayoutProperty('country_1', 'text-field');
				var langCode;

				if (propertyArray.length > 1){
					propertyArray.forEach(function (item : string) {
						var itemString = item.toString();
						if(itemString.includes('name')){
							langCode = itemString.replace('name:', '');
						}
					});
				}

				return langCode ? langCode : 'en';
			},

			toggleSidebar(item : any){
				const map = useMap().map;
				var elem = document.getElementById('sidebar');
				var classes : any = null;
				if(elem != null){
					classes = elem.className.split(' ');
					var collapsed = classes.indexOf('collapsed') !== -1;

					if(collapsed == false){
						classes.push('collapsed');

						if(map != null){
							map.easeTo({
								padding: 0,
								duration: 1000
							});
						}

						elem.className = classes.join(' ');

						setTimeout(() => {
							classes.splice(classes.indexOf('collapsed'), 1);

							if(map != null){
								map.easeTo({
									padding: 300,
									duration: 1000
								});
							}

							elem!.className = classes.join(' ');

							this.showData(item);

						}, 1000);
					}
					else {
						classes.splice(classes.indexOf('collapsed'), 1);

						if(map != null){
							map.easeTo({
								padding: 300,
								duration: 1000
							});
						}

						elem.className = classes.join(' ');

						this.showData(item);
					}

				}
			},
			closeToggle(){
				const map = useMap().map;
				var elem = document.getElementById('sidebar');
				var classes = null;
				if(elem != null){
					classes = elem.className.split(' ');
					var collapsed = classes.indexOf('collapsed') !== -1;

					if(collapsed == false){
						classes.push('collapsed');

						if(map != null){
							map.easeTo({
								padding: 0,
								duration: 1000
							});
						}

						elem.className = classes.join(' ');

					}
				}
			},
			showData(data : any){
				let titleEl = document.querySelector('#sidebar .sidebar-content .sidebar-header .title');
				let listProviderEl = document.querySelector('#sidebar .sidebar-content .list-provider');
				titleEl!.textContent = '';
				listProviderEl!.textContent = '';

				this.getPointDataInLang(data.location_data.center[0], data.location_data.center[1], this.getCurrentLangMap()).then(function (value) {
					let feature = value.features[0];
					var streetName = feature.text;
					let streetArray = streetName.toString().split(" ");
					streetName = (streetArray[streetArray.length - 1] + " " + feature.text.replace(streetArray[streetArray.length - 1], "")).charAt(0).toUpperCase();
					titleEl!.textContent = streetName + " " + feature.address;
				})

				data.provider.forEach(function (item : any) {
					var itemHtml = `
						<div class="provider-item">
							<img class="logo-provider" src="${item.logo}" alt="${item.name}_logo">
							<div class="row-count">
								<div class="on">
									<svg width="21" height="21" viewBox="0 0 24 24">
										<path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z"></path>
									</svg>
									<p>${item.true}</p>
								</div>
								<div class="off">
									<svg width="21" height="21" viewBox="0 0 24 24">
										<path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z"></path>
									</svg>
									<p>${item.false}</p>
								</div>
							</div>
						</div>`;

					listProviderEl!.insertAdjacentHTML('beforeend', itemHtml);
				});

			},

			async getPointDataInLang(lng : any, lat : any, lang : string) {
				const response = await fetch(`https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${apiKey}&language=${lang}`);
				return await response.json();
			}

		},
		mounted() {
			var self = this;
			const map = useMap().map;

			if(map != null){
				let features = [
					{
						"place_name": "Гризодубової вулиця 58, Мелітопольська міська громада, Мелітопольський район, Запорізька область, Україна",
						"location_data": {
							"center": [
								35.379707012325525,
								46.8662014124442
							],
							"place_name": "Гризодубової вулиця 58, Мелітопольська міська громада, Мелітопольський район, Запорізька область, Україна",
							"text": "Гризодубової вулиця",
							"address": "58",
						},
						"provider": [
							{
								"name": "Mediana",
								"logo": "https://localhost:5001/img/provider/mediana.jpeg",
								"true": 100,
								"false": 10
							},
							{
								"name": "Kyivstar",
								"logo": "https://localhost:5001/img/provider/kyivstar.png",
								"true": 10,
								"false": 2
							},
							{
								"name": "Volya",
								"logo": "https://localhost:5001/img/provider/volya.png",
								"true": 3,
								"false": 8
							}
						]
					},
					{
						"place_name": "Гризодубової вулиця 56, Мелітопольська міська громада, Мелітопольський район, Запорізька область, Україна",
						"location_data": {
							"center": [
								35.37900886892291,
								46.86610513188788
							],
							"place_name": "Гризодубової вулиця 56, Мелітопольська міська громада, Мелітопольський район, Запорізька область, Україна",
							"text": "Гризодубової вулиця",
							"address": "56",
						},
						"provider": [
							{
								"name": "Mediana",
								"logo": "https://localhost:5001/img/provider/mediana.jpeg",
								"true": 9,
								"false": 10
							},
							{
								"name": "Kyivstar",
								"logo": "https://localhost:5001/img/provider/kyivstar.png",
								"true": 10,
								"false": 2
							},
							{
								"name": "Volya",
								"logo": "https://localhost:5001/img/provider/volya.png",
								"true": 3,
								"false": 8
							}
						]
					},
				];
				features.forEach(function (item) {
					var el = document.createElement('div');
					el.className = 'marker';
					el.style.display = 'flex';
					el.style.height = '20px';
					el.style.cursor = 'pointer';

					let trueProvider = 0;
					let falseProvider = 0;

					item.provider.forEach(function (providerItem) {
						trueProvider += providerItem.true;
						falseProvider += providerItem.false;
					});

					if(trueProvider >= falseProvider){
						el.insertAdjacentHTML( 'beforeend', '<svg style="color: green" width="20" height="20" viewBox="0 0 24 24">' +
							'<path fill="currentColor" d="'+mdiBrightness1+'"></path></svg>' );
					}
					else{
						el.insertAdjacentHTML( 'beforeend', '<svg style="color: red" width="20" height="20" viewBox="0 0 24 24">' +
							'<path fill="currentColor" d="'+mdiBrightness1+'"></path></svg>' );
					}

					el.addEventListener('click', function () {
						self.toggleSidebar(item);
					});

					new Marker(el).setLngLat([item.location_data.center[0], item.location_data.center[1]]).addTo(map);
				});
			}
		}
	});
</script>

<style lang="scss">
	@import "~@/css/maplibre";

	body {
		margin: 0;
	}

	.map-container{
		height: 100vh;
		width: 100%;
		overflow-x: hidden;
		overflow-y: hidden;
	}

	.rounded-rect {
		background: white;
		border-radius: 10px;
		box-shadow: 0 0 50px -25px black;
	}

	.flex-center {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.flex-center.left {
		left: 45px;
	}

	.flex-center.right {
		right: 45px;
	}

	.sidebar-toggle {}

	.sidebar {
		transition: transform 1s;
		z-index: 1;
		width: 300px;
		height: 100%;

		.sidebar-content {
			position: absolute;
			width: 90%;
			height: 90%;
			font-family: Arial, Helvetica, sans-serif;
			font-size: 32px;
			color: gray;
			padding: 1rem 0.5rem;


			.sidebar-header{
				display: flex;
				flex-wrap: nowrap;
				flex-direction: row;
				justify-content: space-between;
				align-items: flex-start;
				margin-bottom: 1rem;

				p.title{
					font-size: 1rem;
					margin: 0.5rem 0;
				}

				.btn-close{
					z-index: 999;
					margin: 0.3rem;
					font-size: 0.1em;
					cursor: pointer;
				}
			}

			.list-provider{
				display: flex;
				height: inherit;
				overflow-y: auto;
				flex-direction: column;
				flex-wrap: nowrap;
				align-content: space-around;
				justify-content: flex-start;
				align-items: stretch;

				.provider-item{
					position: relative;
					display: inline-flex;
					justify-content: flex-start;
					align-items: center;
					border-bottom: 1px rgb(0 0 0 / 10%) solid;
					padding: 0 1rem;

					.logo-provider{
						height: auto;
						max-width: 65px;
					}

					.row-count{
						position: relative;
						width: 100%;
						display: flex;
						justify-content: flex-end;

						& > div{
							display: flex;
							align-items: center;
							margin: 0 0.5rem;
						}

						.on svg{
							color: green;
						}

						.off svg{
							color: red;
						}

						.on svg, .off svg{
							margin-right: 3px;
						}

						p{
							font-size: 1.3rem;
						}
					}
				}

				.provider-item:last-child{
					border-bottom: none;
				}
			}


		}
	}

	.left.collapsed {
		transform: translateX(-340px);
	}

	.right.collapsed {
		transform: translateX(340px);
	}

</style>
