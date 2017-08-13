<template>
    <div id="content-main">
    	<div class="site-list" v-if="sites.length > 0">
			<Site v-for="site in sites" :data="site" :key="site.url" />
    	</div>
    	<div v-else-if="error">
    		{{error}}
    	</div>
    	<div v-else>
			loading
		</div>
    </div>
</template>

<script>
import Site  from './Site.vue';
import axios from '../libs/axios';

export default {
	name: 'main',
	created (){
		this.fetch();
	},
    methods: {
        fetch: function (){
			axios.get('/config')
			.then( (response)=>{
				this.sites = response.data;
			})
			.catch( (error)=>{
				console.log(error);
				this.error = error.response.data;
			});
        }
    },
	data (){
		return {
			sites: [],
			error: ''
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
