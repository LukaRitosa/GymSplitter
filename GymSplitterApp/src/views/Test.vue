<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/userStore'
    import { ref } from 'vue'
    import { signInWithEmailAndPassword } from 'firebase/auth'
    import { auth } from '@/firebase.js'


    const router=useRouter()
    const userStore=useUserStore()

</script>

<template>




</template>