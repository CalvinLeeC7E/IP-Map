<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'App'
  }
</script>

<style>
  * {
    margin: 0;
    padding: 0;
  }
  
  html, body {
    height: 100%;
    -webkit-font-smoothing: antialiased;
  }
</style>
