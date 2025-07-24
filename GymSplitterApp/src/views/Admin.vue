<script setup>
    import { useRouter } from 'vue-router'

    const router = useRouter()

   const logout = () => {
        localStorage.removeItem('admin')
        router.push('/') 
    } 

</script>

<template>
    <div>
        admin
    </div>

    <button @click="logout" class="border bg-yellow-500 text-white hover:bg-yellow-300 p-2">Odjava</button>
</template>