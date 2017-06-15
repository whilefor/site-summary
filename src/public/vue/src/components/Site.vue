<template>
    <div class="site">
        <div v-if="posts.length > 0">
            <h2>
                <a v-bind:href="url" target="_blank">{{ name }}</a>
            </h2>
            <ul>
                <li v-for="post in posts">
                    <a v-bind:href="post.link" target="_blank">{{ post.title}}</a>
                    <p>{{ post.desc }}</p>
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
    mounted (){
        axios.post('/posts',{
            url: this.data.url
        })
        .then( (response)=>{
            let data   = response.data;
            this.name  = data.name;
            this.url   = data.url;
            this.posts = data.posts;
        })
        .catch( (error)=>{
            console.log(error);
        });
    },
    data (){
        return {
            name: this.data.name,
            url:  this.data.url,
            posts: []
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
    }
}
</style>
