<template>
    <div class="site">
        <a href="#" @click="refresh">refresh</a>
        <div v-if="datas.length > 0">
            <h2>
                <a v-bind:href="url" target="_blank">{{ name }}</a>
            </h2>
            <ul>
                <li v-for="data in datas">
                    <a v-bind:href="data.link" target="_blank">{{ data.title}}</a>
                    <p>{{ data.desc }}</p>
                </li>
            </ul>
        </div>
        <div v-else>loading</div>
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
            axios.post('/posts',{
                url: this.data.url
            })
            .then( (response)=>{
                this.loading = false;
                let data   = response.data;
                this.name  = data.name;
                this.url   = data.url;
                this.datas = data.datas;
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
            name: this.data.name,
            url:  this.data.url,
            datas: []
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
