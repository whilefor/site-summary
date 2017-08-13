<template>
    <div class="site-list-items">
        <p class="site-list-items-actions" >
            <a href="#" @click="toggle">toggle</a>
            <a href="#" @click="refresh">refresh</a>
        </p>
        <div v-if="items.length > 0">
            <h2>
                <a v-bind:href="url" target="_blank">{{ name }}</a>
            </h2>
            <ul v-if="!isHideItems">
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
        toggle: function (){
            this.isHideItems = !this.isHideItems;
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
            items: [],
            isHideItems: false
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.site-list-items{
    position: relative;
    border-top: 1px solid #eceef1;
    min-height: 70px;
    .site-list-items-actions{
        position: absolute;
        top:28px;
        right:20px;
    }
    .site-list-items-actions:hover{ text-decoration: none;}
    a{ text-decoration: none; color: #121821; }
    a:hover{ text-decoration: underline; }
    ul{ margin: 0; padding: 0; } 
    h2{
        padding: 23px 20px;
        margin: 0;
        font-size: 17px;
        font-weight: 600;
        line-height: 27px;
    }

    ul li{
        padding: 20px;
        padding-left: 40px;
        border-top: 1px solid #eceef1;
        line-height: 1;

        a{
            line-height: 21px;
            font-weight: 600;
        }
        p{
            font-size: 11px;
            line-height: 18px;
            color: #3e4551;
            margin-top: 2px;
        }
    }
}
</style>
