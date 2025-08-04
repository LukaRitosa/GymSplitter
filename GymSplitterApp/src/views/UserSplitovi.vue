<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { ref, onMounted } from 'vue'
    import { collection, getDocs, doc, setDoc } from 'firebase/firestore'
    import { useUserStore } from '@/stores/userStore'
    import { db } from '@/firebase'

    const userStore = useUserStore()
    const splits=ref([])

    const dohvatiUserSplitove= async() =>{
        if (!userStore.currentUser) return

        const userSplitsRef = doc(db, `users/${userStore.currentUser.uid}/splits`)
        const snapshot= await getDocs(userSplitsRef)

        splits.value=snapshot.docs.map(doc => ({
            id: doc.id, ...doc.data()
        }))
    }

    onMounted( () =>{
        dohvatiUserSplitove()
    })

</script>

<template>

    <RouterLink to="/SplitBiranje" class="border bg-red-800 text-white">
        +
    </RouterLink>


    
</template>