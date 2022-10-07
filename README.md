# maplibre-gl-vue3-plugin

[![npm](https://img.shields.io/npm/v/maplibre-gl-vue3-plugin.svg?style=flat-square)](https://www.npmjs.com/package/maplibre-gl-vue3-plugin)
[![TypeScript](https://img.shields.io/badge/-Typescript-informational?style=flat-square)](https://www.typescriptlang.org/)
[![vue2](https://img.shields.io/badge/vue-3.x-brightgreen.svg?style=flat-square)](https://vuejs.org/)

A vue plugin for [maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js). Only additional dependency is [mitt](https://github.com/developit/mitt).

Size: [36 KB](https://bundlephobia.com/package/maplibre-gl-vue3-plugin)

## Features

- Typescript support 
- Components for map, controls, sources, marker and layers
- Support for custom controls
- Customizable style switch which reloads sources and layers automatically
- Frame rate control included
- Support for multiple instances and global access by `useMap(key: string | symbol)`

## Table of contents

- [Installation](#installation)
- [Usage](#usage)

# Installation

```shell
yarn add maplibre-gl-vue3-plugin maplibre-gl
```

## Default import

Global Install:

```typescript
import VueMaplibreGl from 'maplibre-gl-vue3-plugin'

app.use(VueMaplibreGl)
```

Add SCSS:

```scss
@import "~maplibre-gl-vue3-plugin/src/css/maplibre";
```

Use specific components:

```typescript
import { MglMap } from 'maplibre-gl-vue3-plugin'

app.component('MglMap', MglMap)
```

or in a parent components `.vue` file

```html

<script>
	import { MglMap } from 'maplibre-gl-vue3-plugin'

	export default {
		components: {
			MglMap
		},
		// ...
	}
</script>
```

# Usage

See [/dev/serve.vue](https://github.com/yevgen4989/maplibre-gl-vue3-plugin/blob/master/dev/serve.vue) for a real world example.

# Demo

```shell
git clone https://github.com/yevgen4989/maplibre-gl-vue3-plugin.git
cd maplibre-gl-vue3-plugin
yarn
yarn serve
```

## PRs welcome ♥

If you have ideas, improvements, suggestions etc. don't hesitate to open a pull request.

### Todos

- [ ] Generate separate css file to be included (currently, you have to use scss)
- [ ] Usage examples
- [ ] Demo
- [ ] API documentation
- [ ] Support `v-model:...` for some basic props
- [x] Add layer events
- [x] Add lang switcher
- [ ] Add [Web-types](https://github.com/JetBrains/web-types)
- [x] Add [frame rate control](https://github.com/mapbox/mapbox-gl-framerate)

## License

[MIT](http://opensource.org/licenses/MIT)
