<script lang="ts">
	import { onMount } from 'svelte'
	import { DOT_RADIUS } from './constants'
	import { inputColor, paletteColor } from './palette.store'
	import { get } from 'svelte/store'

	let slider: HTMLElement
	let isMouseDown = false
	let sliderRect: DOMRect
	const dotRadius = DOT_RADIUS
	let dotRadiusRatio: number
	let sliderPositionRatio: number | undefined

	const updateColor = (h: number) => {
		paletteColor.update((hsva) => {
			if (!hsva) return hsva
			return { ...hsva, h }
		})
	}
	const handleMouseDown = () => {
		isMouseDown = true
	}
	const handleMouseUp = () => {
		isMouseDown = false
	}
	const handleMouseMove = (e: MouseEvent) => {
		if (isMouseDown === false) return
		if (!sliderRect) return
		const { clientY } = e
		const { top, height } = sliderRect
		sliderPositionRatio = ((clientY - top) / height) * 100
		if (sliderPositionRatio <= dotRadiusRatio) sliderPositionRatio = dotRadiusRatio
		if (sliderPositionRatio >= 100 - dotRadiusRatio) sliderPositionRatio = 100 - dotRadiusRatio
		const h = setHValue(sliderPositionRatio)
		updateColor(h)
	}
	const hsvaToSliderPosition = (h: number | undefined) => {
		if (!h) return
		let vRatio = (h / 360) * 100
		if (h === 0) {
			vRatio = dotRadiusRatio
		}
		if (h === 360) {
			vRatio = 100 - dotRadiusRatio
		}
		return vRatio
	}
	const setHValue = (position: number) => {
		let h = (position / 100) * 360
		if (position === dotRadiusRatio) h = 0
		if (position === 100 - dotRadiusRatio) h = 360
		return h
	}

	onMount(() => {
		if (!$inputColor) return
		sliderRect = slider.getBoundingClientRect()
		if (!sliderRect.height) return
		dotRadiusRatio = (dotRadius / sliderRect.height) * 100
		if (dotRadiusRatio) {
			sliderPositionRatio = hsvaToSliderPosition(get(inputColor)?.h)
		}
	})
</script>

<!-- color slider -->
<svelte:window on:mouseup={handleMouseUp} />
<div class="sliderWrapper h-full w-full select-none p-[2px]" on:mousemove={handleMouseMove}>
	<div
		bind:this={slider}
		on:mousedown={handleMouseDown}
		class="slider relative h-full w-2.5 rounded-md"
		style=""
	>
		{#if sliderPositionRatio && dotRadiusRatio}
			<div
				on:mousedown={handleMouseDown}
				class="sliderDot z-1 absolute left-0 right-0 mx-auto cursor-grab
							rounded-full bg-base-500 "
				style="width:{dotRadius * 2}px; height:{dotRadius * 2}px; top:{sliderPositionRatio -
					dotRadiusRatio}%;"
			/>
		{/if}
	</div>
</div>

<style>
	.slider {
		--gradient: #ff0000, #ffff00 17.2%, #ffff00 18.2%, #00ff00 33.3%, #00ffff 49.5%, #00ffff 51.5%,
			#0000ff 67.7%, #ff00ff 83.3%, #ff0000;
		background: linear-gradient(var(--gradient));
	}
</style>
