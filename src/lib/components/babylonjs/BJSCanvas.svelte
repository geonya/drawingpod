<script lang="ts">
	import { BJSApp } from '$lib/components/babylonjs/BJSApp'
	import { onMount } from 'svelte'

	let canvas: HTMLCanvasElement

	onMount(async () => {
		new BJSApp(canvas).run()
	})
</script>

<canvas bind:this={canvas} id="canvas" class="h-48 w-48 outline-none" />
