<script setup>
    import { RouterLink, useRouter } from 'vue-router'

    const router = useRouter()

   const logout = () => {
        localStorage.removeItem('admin')
        router.push('/') 
    } 

</script>

<template>

    <div class="min-h-screen flex items-center justify-center bg-red-900 text-white px-4">

        <div class="flex flex-col items-center space-y-4">

            <div class="text-4xl font-bold my-4">
                    Admin
            </div>

            <div >
                <RouterLink to="/vjezbaMaker" class="w-full bg-red-500 text-white rounded hover:bg-red-300 p-2 font-semibold m-4">Vjezba maker</RouterLink>
            
                <RouterLink to="/splitMaker" class="w-full bg-red-700 text-white rounded hover:bg-red-300 p-2 font-semibold m-4">Split maker</RouterLink>
            </div>

            <button @click="logout" class="border bg-black text-white hover:bg-red-300 p-2 m-4 rounded">Odjava</button>

        </div>

    </div>

</template>