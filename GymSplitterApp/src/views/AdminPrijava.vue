<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/userStore'
    import { ref } from 'vue'
    import { signInWithEmailAndPassword } from 'firebase/auth'
    import { auth } from '@/firebase.js'

    const email = ref('')
    const password = ref('')
    const poruka=ref({ error: false, message: '' })

    const loading = ref(false)
    
    const admin_mail='admin@gmail.com'
    const admin_lozinka='lozinka123'

    const router=useRouter()
    const userStore=useUserStore()

    const admin_login = () => {
    if (email.value === admin_mail && password.value === admin_lozinka) {
        localStorage.setItem('admin', 'true')
        router.push('/admin')
    } else {
        error.value = 'Neispravan email ili lozinka'
    }
    }

</script>

<template>



    <div class="min-h-screen flex items-center justify-center bg-red-900 text-red-900 px-4">
        
        <div class="bg-gray-100 p-6 rounded-md w-full max-w-md">
            
            <div class="text-center mb-6 p-4">
                    <div class="text-4xl font-serif font-bold">GymSplitter</div>
                    <div class="text-center text-3xl mt-2">🏋️‍♀️</div>
            </div>
            
            <div class="flex justify-center border-b border-gray-300 mb-6">
                <RouterLink to="/" class="px-4 py-2 font-semibold text-gray-700 hover:text-red-700">Prijava</RouterLink>
                <RouterLink to="/registracija" class="px-4 py-2 font-semibold text-gray-700 hover:text-red-700">Registracija</RouterLink>
            </div>

        <form @submit.prevent="admin_login" class="space-y-4">

            <div>
                <div>
                    <b>Email:</b>
                </div>   
                <input type="text" class="border p-1 w-full" placeholder="Mail..." v-model="email">
            </div>

            <div>   
                <div>
                    <b>Lozinka:</b>                    
                </div> 
                <input type="password" class="border p-1 w-full" placeholder="Lozinka..." v-model="password">
            </div>

            <button :disabled="loading" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold" type="submit">
                <span v-if="!loading">Admin prijava</span>
                <span v-else><img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="inline w-5 h-5" /></span>
            </button>



        </form>

            <div v-if="poruka.message" :class="poruka.error ? 'text-red-500' : 'text-green-600'">{{ poruka.message }}</div>


        </div>

    </div>




</template>