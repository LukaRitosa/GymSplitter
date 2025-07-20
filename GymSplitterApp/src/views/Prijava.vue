<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/userStore'
    import { ref } from 'vue'
    import { signInWithEmailAndPassword } from 'firebase/auth'
    import { auth } from '@/firebase.js'

    const email = ref('')
    const password = ref('')
    const poruka=ref({ error: false, message: '' })

    const prijava = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)

            userStore.setCurrentUserLogIn({
                email: userCredential.user.email,
                uid: userCredential.user.uid,
            })

            poruka.value.error = false;
            poruka.value.message = 'Korisnik prijavljen: ' + JSON.stringify(userCredential.user)

            router.push("/pocetna")

        } catch (error) {
            poruka.value.error = true
            poruka.value.message = 'Greška pri prijavi: ' + error.message
        }
    }

    const router=useRouter()
    const userStore=useUserStore()

</script>

<template>



    <div class="min-h-screen flex items-center justify-center bg-gray-100 text-red-900 px-4">
        
        <div class="bg-white p-6 rounded-md w-full max-w-md">
            
            <div class="text-center mb-6 p-4">
                    <div class="text-4xl font-serif font-bold">GymSplitter</div>
                    <div class="text-center text-3xl mt-2">🏋️‍♀️</div>
            </div>
            
            <div class="flex justify-center border-b border-gray-300 mb-6">
                <span class="px-4 py-2 border-b-2 font-semibold border-red-700 text-red-700">Prijava</span>
                <RouterLink to="/registracija" class="px-4 py-2 font-semibold text-gray-700 hover:text-red-700">Registracija</RouterLink>
            </div>

        <form @submit.prevent="prijava" class="space-y-4">

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
                <input type="text" class="border p-1 w-full" placeholder="Lozinka..." v-model="password">
            </div>

            <button class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold" type="submit">Registracija</button>

            <div v-if="poruka.message" :class="poruka.error ? 'text-red-500' : 'text-green-600'">{{ poruka.message }}</div>

        </form>

        </div>

    </div>




</template>