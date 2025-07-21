<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/userStore'
    import { onMounted, ref } from 'vue'
    import { signOut, deleteUser } from 'firebase/auth';
    import { auth, db } from '@/firebase.js'
    import { doc, getDoc } from 'firebase/firestore'


    const userPodaci = ref(null)

    onMounted(async () => {
    if (currentUser && currentUser.uid) {
        const docRef = doc(db, "users", currentUser.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            userPodaci.value = docSnap.data()
        }
    }
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
    
    <div class="flex flex-col items-center justify-center h-screen bg-red-50 text-red-950 gap-6 p-6">
        
        
        <div v-if="userPodaci" class="text-xl space-y-2">
            <div>
                <b>Ime i prezime:</b> {{ userPodaci.username }}
            </div>
            <div>
                <b>Email:</b> {{ userPodaci.email }}
            </div>
            <div>
                <b>Iskustvo:</b> {{ userPodaci.iskustvo || 'Nije postavljeno' }}
            </div>
            <div>
                <b>Slobodno vrijeme:</b> {{ userPodaci.slobodnoVrijeme || 'Nije uneseno' }}
            </div>
            <div>
                <b>Trenutni split:</b> {{ userPodaci.trenutniSplit || 'Nema postavljen' }}
            </div>
        </div>

        <div v-if="userPodaci && (!userPodaci.slobodnoVrijeme || !userPodaci.iskustvo)" class="flex flex-col items-center justify-center ">
            <div>
                Preporučamo da riješiš naš test za procjenu tvog iskustva  i vremena na raspolaganju!             
            </div>
            <div>
                <RouterLink to="/test" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold">Test</RouterLink>
            </div>
        </div>

        <div v-else>
            <RouterLink to="/test" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold">Promjeni podatke</RouterLink>
        </div>




        <form @submit.prevent="logout">
            <button class="border bg-yellow-500 text-white hover:bg-yellow-300 p-2" type="submit">Odjava</button>
        </form>
        
        <div class="text-red-500">{{ poruka }}</div>

    </div>

</template>