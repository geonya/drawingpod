<script lang="ts">
	import type { MenuTitle } from '$lib/types'
	import Icon from './Icon.svelte'
	import MenuContentGenerator from './panel/MenuContentGenerator.svelte'
	import MenuPanel from './panel/MenuPanel.svelte'
	import TopPanel from './panel/TopPanel.svelte'

	let isMenuOpen = false

	let menuTitle: MenuTitle | null = null

	function toggleMenu() {
		isMenuOpen = !isMenuOpen
	}
	function closeMenu() {
		isMenuOpen = false
	}
</script>

<div class="fixed top-5 left-0 right-0 z-50 mx-auto w-full ">
	<div class="">
		<div class="absolute left-20 top-2">
			<button
				class="p-2 hover:rounded-full hover:bg-base-100 hover:opacity-80"
				on:click={toggleMenu}
			>
				<Icon name="menu" class="h-6 w-6" />
			</button>
			{#if isMenuOpen}
				<MenuPanel on:close={closeMenu} bind:isMenuOpen bind:menuTitle />
			{/if}
		</div>
		<!-- Top Control Panel -->
		<TopPanel />
		<!-- 우측 버튼 모음 -->
		<div class="absolute top-0 right-12 hidden md:block">
			<div class="flex h-full items-center justify-center space-x-3">
				<button class="rounded-md bg-blue-400 p-2 text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width={1.5}
						stroke="currentColor"
						class="h-5 w-5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
						/>
					</svg>
				</button>
				<button
					class="flex flex-shrink items-center space-x-2 rounded-md border px-3 py-1.5 hover:bg-base-100"
				>
					<Icon name="storage" />
					<span>창꼬</span>
				</button>
			</div>
		</div>
	</div>
</div>
{#if isMenuOpen}
	<button
		class="fixed inset-0 z-30 h-full w-full"
		on:click={() => {
			isMenuOpen = false
		}}
	/>
{/if}
<MenuContentGenerator bind:menuTitle />
