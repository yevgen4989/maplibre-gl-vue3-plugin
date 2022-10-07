import { defineComponent, h, PropType, ref, warn, watch } from 'vue';

export enum ButtonType {
	DEFAULT     = 'default',
}

export type ButtonTypeValue = keyof Record<ButtonType, any>;
export const ButtonTypeValues = Object.values(ButtonType);

interface Default {
	size: number;
	viewbox: string;
}

const types: Record<ButtonType, Default> = {
	[ ButtonType.DEFAULT ]        : {
		size   : 21,
		viewbox: '0 0 24 24'
	},
};


export default defineComponent({
	name : 'MdiIcon',
	props: {
		type   : {
			type     : String as PropType<ButtonTypeValue>,
			default  : ButtonType.DEFAULT,
			validator: (v: ButtonType) => {
				return ButtonTypeValues.indexOf(v) !== -1;
			}
		},
		path   : {
			type: String as PropType<string>
		},
		size   : Number as PropType<number>,
		viewbox: String as PropType<string>
	},
	setup(props) {

		if (!props.path) {
			warn('property `path` must be set on MdiIcon');
		}

		const defaults = ref(types[ props.type ] || types.default);
		watch(() => props.type, v => defaults.value = types[ v ] || types.default);

		return { defaults };

	},
	render() {
		return h(
			'svg',
			{
				width  : this.size || this.defaults!.size,
				height : this.size || this.defaults!.size,
				viewBox: this.viewbox || this.defaults!.viewbox
			},
			h('path', { fill: 'currentColor', d: this.path })
		);
	}
});
