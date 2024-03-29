<script lang="ts">
	import type { HsvaColor } from 'colord'
	import { onMount } from 'svelte'
	import { get } from 'svelte/store'
	import { DOT_RADIUS } from './constants'
	import { paletteColor, inputColor, hsvaToStringRgba } from './palette.store'

	interface RatioPositionXY {
		xRatio: number
		yRatio: number
	}
	let pickerBg: HTMLElement
	let pickerBgRect: DOMRect
	let isMouseDown = false
	const dotRadius = DOT_RADIUS
	let dotRadiusRatio: RatioPositionXY
	let pickerPosition: RatioPositionXY

	$: if (dotRadiusRatio && $inputColor) {
		pickerPosition = hsvaToPickerPosition($inputColor)
	}

	$: bgColor = $paletteColor && hsvaToStringRgba({ ...$paletteColor, s: 100, v: 100, a: 1 })

	const updatePlatteColor = (position: RatioPositionXY) => {
		const sv = positionToSv(position)
		paletteColor?.update((hsva) => {
			if (!hsva) return hsva
			return { ...hsva, s: sv.s, v: sv.v }
		})
	}
	const positionToSv = (position: RatioPositionXY) => {
		const _position = { ...position }
		const { xRatio, yRatio } = _position
		let s = (xRatio / 100) * 100
		let v = ((100 - yRatio) / 100) * 100
		if (xRatio <= dotRadiusRatio.xRatio) {
			s = 0
		}
		if (xRatio >= 100 - dotRadiusRatio.xRatio) {
			s = 100
		}
		if (yRatio <= dotRadiusRatio.yRatio) {
			v = 100
		}
		if (yRatio >= 100 - dotRadiusRatio.yRatio) {
			v = 0
		}
		return { s, v }
	}

	const handleMouseDown = () => {
		isMouseDown = true
	}
	const handleMouseUp = () => {
		isMouseDown = false
	}
	const handleMouseMove = (e: MouseEvent) => {
		if (isMouseDown === false) return
		const { clientX, clientY } = e
		let { left, top, width, height } = pickerBgRect
		if (left <= 0 || top <= 0 || width <= 0 || height <= 0) {
			pickerBgRect = pickerBg.getBoundingClientRect()
			;({ left, top, width, height } = pickerBgRect)
		}
		let [offsetX, offsetY] = [clientX - left, clientY - top]
		if (offsetX <= dotRadius) {
			offsetX = dotRadius
		}
		if (offsetX >= width - dotRadius) {
			offsetX = width - dotRadius
		}
		if (offsetY <= dotRadius) {
			offsetY = dotRadius
		}
		if (offsetY >= height - dotRadius) {
			offsetY = height - dotRadius
		}
		pickerPosition = { xRatio: (offsetX / width) * 100, yRatio: (offsetY / height) * 100 }
		updatePlatteColor(pickerPosition)
	}

	const hsvaToPickerPosition = (hsva: HsvaColor | null): RatioPositionXY => {
		if (!hsva) return { xRatio: 0, yRatio: 0 }
		const { s, v } = hsva as { s: number; v: number }
		let xRatio = s
		let yRatio = ((100 - v) / 100) * 100

		if (s === 0) {
			xRatio = dotRadiusRatio.xRatio
		}
		if (v === 0) {
			yRatio = 100 - dotRadiusRatio.yRatio
		}
		if (s >= 100) {
			xRatio = 100 - dotRadiusRatio.xRatio
		}
		if (v >= 100) {
			yRatio = dotRadiusRatio.yRatio
		}
		return { xRatio, yRatio }
	}

	onMount(() => {
		pickerBgRect = pickerBg.getBoundingClientRect()
		if (pickerBgRect && pickerBgRect.width && pickerBgRect.height) {
			dotRadiusRatio = {
				xRatio: (dotRadius / pickerBgRect.width) * 100,
				yRatio: (dotRadius / pickerBgRect.height) * 100,
			}
		}
		bgColor = $inputColor && hsvaToStringRgba({ h: $inputColor.h, s: 100, v: 100, a: 1 })
	})
</script>

<svelte:window on:mouseup={handleMouseUp} />
<div
	class="h-full w-full select-none rounded-sm p-3"
	id="pickerBgWrapper "
	on:mousemove={handleMouseMove}
>
	<div
		class="relative h-32 w-32 rounded-md"
		id="pickerBg"
		style="--bg-color:{bgColor};"
		on:mousedown|self={handleMouseDown}
		bind:this={pickerBg}
	>
		{#if pickerPosition && dotRadiusRatio}
			<div
				on:mousedown|self={handleMouseDown}
				id="pickerDot"
				class="absolute cursor-grab rounded-full bg-base-600"
				style="width:{dotRadius * 2}px; height:{dotRadius * 2}px; top:{pickerPosition.yRatio -
					dotRadiusRatio.yRatio}%; left:{pickerPosition.xRatio - dotRadiusRatio.xRatio}%;"
			/>
		{/if}
	</div>
</div>

<style>
	#pickerBg {
		background: linear-gradient(#ffffff00, #000000ff),
			linear-gradient(0.25turn, #ffffffff, #00000000), var(--bg-color);
	}
</style>
