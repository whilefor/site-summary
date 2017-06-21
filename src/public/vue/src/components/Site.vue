<template>
    <div class="site">
        <a href="#" @click="refresh">refresh</a>
        <div v-if="items.length > 0">
            <h2>
                <a v-bind:href="url" target="_blank">{{ name }}</a>
            </h2>
            <ul>
                <li v-for="item in items">
                    <a v-bind:href="item.link" target="_blank">{{ item.title}}</a>
                    <p>{{ item.desc }}</p>
                </li>
            </ul>
        </div>

        <div v-if="loading">loading</div>
        <div v-if="error">{{ error }}</div>
    </div>
</template>

<script>
import axios from '../libs/axios';

export default {
    name: 'site',
    props: ['data'],
    created (){
        this.fetch();
    },
    methods: {
        refresh: function (){
            !this.loading && this.fetch();
        },
        fetch: function (){
            this.loading = true;
            axios.post('/site',{
                url: this.data.url
            })
            .then( (response)=>{
                this.loading = false;
                if(response.data.error){
                    this.error = response.data.error;
                    return;
                }

                let data   = response.data;
                this.name  = data.name;
                this.url   = data.url;
                this.items = data.data;
            })
            .catch( (error)=>{
                this.loading = false;
                console.log(error);
            });
        }
    },
    data (){
        return {
            loading: true,
            error: '',
            name: '',
            url:  '',
            items: []
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.site{
    width: 400px;
    padding: 10px;
    border: 1px solid #aaa;
    h2 {
        font-size: 15px;
        text-align: center;
    }
    ul {
        font-size: 15px;
        padding: 0px;
        li p{
            font-size: 13px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
</style>
