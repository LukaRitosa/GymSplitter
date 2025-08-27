<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/userStore'
    import { onMounted, ref } from 'vue'
    import { signOut, deleteUser } from 'firebase/auth';
    import { auth, db } from '@/firebase.js'
    import { doc, getDoc } from 'firebase/firestore'


    const userPodaci = ref(null)
    const loading = ref(null)
    

    onMounted(async () => {
        
        loading.value=true

        if (currentUser && currentUser.uid) {
            const docRef = doc(db, "users", currentUser.uid)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                userPodaci.value = docSnap.data()
            }
        }


        loading.value=false
    })



    const logout = () => {
        signOut(auth);
        userStore.logout
        router.push("/")
    }

    const poruka=ref("") 

    const router=useRouter()
    const userStore=useUserStore()

    const currentUser = userStore.currentUser


</script>

<template>

    <form @submit.prevent="logout" class="bg-red-50 rounded" v-if=!loading>
        <button class="border bg-red-500 text-white hover:bg-red-300 p-2 rounded m-4 font-semibold" type="submit">Odjava</button>
    </form>
    
    <div v-if="!loading" class="flex flex-col items-center justify-center h-screen bg-red-50 text-red-950 gap-6 p-6">

        <div class="text-center mb-6 p-4">
                <div class="text-5xl font-serif font-bold">GymSplitter</div>
                <div class="text-center text-4xl mt-2">🏋️‍♀️</div>
        </div>
        
        
        <div v-if="userPodaci" class="text-xl space-y-2">
            <div>
                <b>Ime i prezime:</b> {{ userPodaci.username }}
            </div>
            <div>
                <b>Slobodno vrijeme:</b> {{ userPodaci.slobodnoVrijeme || 'Nije uneseno' }}
            </div>
        </div>

        <div v-if="userPodaci && !userPodaci.slobodnoVrijeme" class="flex flex-col items-center justify-center ">
            <div class="my-4">
                Preporučamo da riješiš naš test za procjenu tvog slobodnog vremena na raspolaganju za bolje prijedloge!             
            </div>
            <div >
                <RouterLink to="/test" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold">Test</RouterLink>
            </div>
        </div>

        <div v-else>
            <RouterLink to="/test" class="w-full bg-gray-800 text-white rounded hover:bg-gray-600 p-2 font-semibold">Promjeni podatke</RouterLink>
        </div>

        <div >
            <RouterLink to="/Split" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold"> Split</RouterLink>
        </div>

        <div >
            <RouterLink to="/kalendar" class="w-full bg-pink-800 text-white rounded hover:bg-pink-600 p-2 font-semibold"> Kaledar</RouterLink>
        </div>


        
        
        <div class="text-red-500">{{ poruka }}</div>

    </div>

    <div v-else class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>

</template>