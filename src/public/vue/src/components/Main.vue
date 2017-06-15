<template>
    <div id="main">
    	<div v-if="sites.length > 0">
    		<div v-for="site in sites">
				<Site :data="site" />
    		</div>
    	</div>
    	<div v-else> loading </div>
    </div>
</template>

<script>
import Site  from './Site.vue';
import axios from '../libs/axios';

export default {
	name: 'main',
	mounted (){
		axios.get('/config')
		.then( (response)=>{
			this.sites = response.data;
		})
		.catch( (error)=>{
			console.log(error);
		});
	},
	data (){
		return {
			sites: [],
		}
	},
	components: {
		Site
	}
}
</script>

<style>
ul, li{
	list-style: none;
}
</style>
