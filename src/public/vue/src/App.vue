<template>
    <div id="app">
    	<header id="header">
    		<div id="header-wrap">
				<div id="header-left">
					<h1>Site Summary</h1>
				</div>
				<div id="header-right">
					
				</div>
    		</div>
    	</header>

    	<div id="content">
        	<router-view></router-view>
    	</div>
    </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="less" scoped>
#header{
	position: absolute;
    top: 0;
    left: 0;
    z-index: 5;
    width: 100%;
    will-change: top;

    height: 60px;
    background-color: #2d72d9;
	#header-wrap{
		max-width: 1000px;
   		margin: 0 auto;
	    #header-left{
	    	h1{
	    		font-size: 20px;
	    		line-height: 60px;
	    		margin: 0px;
	    	}
			float: left;
			color: #fff;

	    }
	}
}

#content{
	max-width: 1000px;
    margin: 0 auto;
    margin-top: 85px;
    margin-bottom: 20px;
    background-color: #fff;
}


</style>
