<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref, onMounted } from 'vue'
    import { doc, getDoc } from 'firebase/firestore'
    import { db } from '@/firebase'
    import { useUserStore } from '@/stores/userStore'

    const userStore = useUserStore()
    const trenutniSplit = ref(null)
    const splitPodaci = ref(null)
    const router=useRouter()
    const loadnig=ref(false)

    const danas = ref(new Date().toLocaleDateString("sv-SE"))


    const dohvatiTrenutniSplit = async () => {

        const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
            const data = userDocSnap.data()
            trenutniSplit.value = data.trenutniSplit
            console.log("trenutniSplit:", trenutniSplit.value)
        } else {
            console.warn("User dokument ne postoji.")
        }
    }


    const dohvatiSplit = async () => {
        if (!userStore.currentUser || !trenutniSplit.value) return

        const splitRef = doc(db, `users/${userStore.currentUser.uid}/splits/${trenutniSplit.value}`)
        const splitSnap = await getDoc(splitRef)

        if (splitSnap.exists()) {
            splitPodaci.value = splitSnap.data()
        }
    }

    onMounted(async () => {
        await dohvatiTrenutniSplit()
        await dohvatiSplit()
    })
</script>


<template>
    <div v-if="splitPodaci" class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-red-900 px-4 text-center">

        <div class="my-4">
            <RouterLink to="/UserSplitovi" class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold"> Splitovi</RouterLink>
        </div>

        

        <h2 class="text-3xl font-bold text-gray-800 mb-2">{{ splitPodaci.naziv }}</h2>

        <p class="text-sm text-gray-600 mb-4">Broj dana: {{ splitPodaci.broj_dana }}</p>

        <p class="text-sm text-gray-600 mb-4">Opis: {{ splitPodaci.opis }}</p>
        

        <div class="grid grid-cols-1 gap-4 my-4">
            <div v-for="dan in splitPodaci.dani" :key="dan.dan" class="p-6 rounded-lg border border-gray-300 shadow-md bg-red-900 text-white cursor-pointer hover:bg-red-700 transition"
            :class="{'ring-4 ring-red-300': splitPodaci.kalendar[danas].split_dan_id === dan.dan}" @click="router.push(`/UrediDan/${dan.dan}`)">
                Dan {{ dan.dan }}  {{ dan.naziv }} ({{ dan.vjezbe.length }} vježba)
            </div>
        </div>
        
        <div class="my-4">
            <RouterLink to="/pocetna" class="w-full bg-red-600 text-white rounded hover:bg-red-400 p-2 font-semibold"> Početna</RouterLink>
        </div>

        <div class="my-4">
            <RouterLink to="/kalendar" class="w-full bg-black text-white rounded hover:bg-red-400 p-2 font-semibold"> Kalendar</RouterLink>
        </div>

    </div>

    <div v-else class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-red-900 px-4 text-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>

</template>
