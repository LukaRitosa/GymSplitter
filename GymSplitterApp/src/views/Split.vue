<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref, onMounted } from 'vue'
    import { doc, getDoc } from 'firebase/firestore'
    import { db } from '@/firebase'
    import { useUserStore } from '@/stores/userStore'

    const userStore = useUserStore()
    const trenutniSplit = ref(null)
    const splitPodaci = ref(null)


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

    <h2 class="text-2xl font-bold">{{ splitPodaci.naziv }}</h2>

    <p>Broj dana: {{ splitPodaci.broj_dana }}</p>

    <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
        <li v-for="dan in splitPodaci.dani" :key="dan.dan">
            Dan {{ dan.dan }}  {{ dan.naziv }} ({{ dan.vjezbe.length }} vježba)
        </li>
    </ul>

    </div>

    <div v-else>
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>

</template>
