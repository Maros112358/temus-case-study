<script>
	import PromptForm from './PromptForm.svelte';
import Upload from './upload.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="main">
	<div class="container">
		<Upload/>
		<PromptForm/>
	</div>
</div>

<style>
	.main {
		background-color: rgb(39, 39, 42);
		height: 100vh;
	}

	.container {
		display: flex;
		flex-direction: row;
	}

	/* Optional: Style individual components if needed */
	/* Example:
	.container > * {
		flex: 1;  Adjust the flex-grow, flex-shrink, and flex-basis properties as needed
	}
	*/
</style>