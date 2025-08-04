<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref, onMounted } from 'vue'
    import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
    import { useUserStore } from '@/stores/userStore'
    import { db } from '@/firebase'

    const userStore = useUserStore()
    const userPodaci = ref(null)
    const splits=ref([])
    const loading = ref(false)
    const router=useRouter()

    const dohvatiUserSplitove= async() =>{
        loading.value=true
        if (!userStore.currentUser) return

        const userSplitsRef = collection(db, `users/${userStore.currentUser.uid}/splits`)
        const snapshot= await getDocs(userSplitsRef)

        splits.value=snapshot.docs.map(doc => ({
            id: doc.id, ...doc.data()
        }))
        loading.value=false
    }
    
    const getUser= async () => {
        if (userStore.currentUser?.uid) {
            const docSnap = await getDoc(doc(db, 'users', userStore.currentUser.uid))
            if (docSnap.exists()) {
                userPodaci.value = docSnap.data()
            }
        }
    }

    const odaberiSplit= async (splitId) =>{
        if (!userStore.currentUser?.uid) return

        try {
            const userRef = doc(db, 'users', userStore.currentUser.uid)
            await updateDoc(userRef, {
            trenutniSplit: splitId
            })

            userPodaci.value.trenutniSplit = splitId
            router.push('/pocetna')
        } catch (error) {
            console.error("Greška pri postavljanju trenutnog splita:", error)
        }
    }

    onMounted(async () => {
        await dohvatiUserSplitove()
        await getUser()
    })


</script>

<template>

    <div v-if="!loading">
        <div>
            <RouterLink to="/SplitBiranje" class="border bg-red-800 text-white">
                +
            </RouterLink>

            <div v-for="split in splits" :key="split.id" @click="odaberiSplit(split.id)"
                :class="['p-4 m-2 rounded border', 
                userPodaci?.trenutniSplit === split.id
                    ? 'border-red-300 bg-red-800 text-white'                                     
                    : 'border-gray-300 bg-gray-300']">
                {{ split.naziv }}
                {{ split.broj_dana }}
            </div>
        </div>
    </div>

    <div v-else>
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>
    
    <RouterLink to="/pocetna" class="border bg-red-800 text-white">
        pocetna
    </RouterLink>
    
</template>