<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref, onMounted } from 'vue'
    import { collection, getDocs, doc, setDoc } from 'firebase/firestore'
    import { useUserStore } from '@/stores/userStore'
    import { db } from '@/firebase'

    const userStore= useUserStore()
    const splits=ref([])
    const router=useRouter()


    const dohvatiSplitove = async () => {
        const snapshot = await getDocs(collection(db, 'splits'))
        splits.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }

    onMounted(dohvatiSplitove)

    const odaberiSplit = async (split) => {

        const userSplitRef = doc(db, `users/${userStore.currentUser.uid}/splits/${split.id}`)
        await setDoc(userSplitRef, JSON.parse(JSON.stringify(split)))

        const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
        await setDoc(userDocRef, { trenutniSplit: split.id }, { merge: true })

        router.push('/Split')

    }

</script>

<template>

    <div>

        <div v-for="split in splits" class="border rounded p-4 mb-4 shadow">
            <h3 class="text-xl font-semibold">{{ split.naziv }}</h3>
            <p>Broj dana: {{ split.broj_dana }}</p>

            <ul class="mt-2 list-disc pl-5 text-sm text-gray-700">
                <li v-for="dan in split.dani" :key="dan.dan">
                Dan {{ dan.dan }} – {{ dan.naziv }} ({{ dan.vjezbe.length }} vježbi)
                </li>
            </ul>

            <button @click="odaberiSplit(split)" class="mt-3 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded">
                Odaberi ovaj Split
            </button>
        </div>

    </div>

</template>