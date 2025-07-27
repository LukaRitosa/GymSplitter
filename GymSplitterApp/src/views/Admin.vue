<script setup>
    import { RouterLink, useRouter } from 'vue-router'

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

    <div >
        <RouterLink to="/vjezbaMaker" class="w-full bg-yellow-800 text-white rounded hover:bg-yellow-600 p-2 font-semibold">Vjezba maker</RouterLink>
    </div>

    <div >
        <RouterLink to="/splitMaker" class="w-full bg-blue-800 text-white rounded hover:bg-blue-600 p-2 font-semibold">Split maker</RouterLink>
    </div>

    <button @click="logout" class="border bg-yellow-500 text-white hover:bg-yellow-300 p-2">Odjava</button>
</template>