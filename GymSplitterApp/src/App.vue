<script setup>
 import { RouterView } from 'vue-router'
</script>

<template>


    <RouterView />


</template>

<style scoped>
        a.router-link-exact-active {
        color: blue;
    }
    a {
        color: black;
        display: inline-block;
        padding: 0 1rem;
        border-left: 1px solid black;
    }
</style>