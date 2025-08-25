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
    <div v-if="splitPodaci">

    <div >
        <RouterLink to="/UserSplitovi" class="w-full bg-green-800 text-white rounded hover:bg-red-600 p-2 font-semibold"> Splitovi</RouterLink>
    </div>

    <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ splitPodaci.naziv }}</h2>

    <p class="text-sm text-gray-600 mb-4">Broj dana: {{ splitPodaci.broj_dana }}</p>

    <div class="grid grid-cols-1 gap-4">
        <div v-for="dan in splitPodaci.dani" :key="dan.dan" class="p-6 rounded-lg border border-gray-300 shadow-md bg-red-900 text-white cursor-pointer hover:bg-red-700 transition"
        :class="{'ring-4 ring-red-500': dan.dan === (splitPodaci.sljedeci_dan + 1)}" @click="router.push(`/UrediDan/${dan.dan}`)">
            Dan {{ dan.dan }}  {{ dan.naziv }} ({{ dan.vjezbe.length }} vježba)
        </div>
    </div>

    </div>

    <div v-else>
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>

</template>
