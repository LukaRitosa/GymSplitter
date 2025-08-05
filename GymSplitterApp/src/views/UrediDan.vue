<script setup>
    import { ref, onMounted } from 'vue'
    import { doc, getDoc} from 'firebase/firestore'
    import { db } from '@/firebase'
    import { useUserStore } from '@/stores/userStore'
    import { useRouter } from 'vue-router'

    const router= useRouter()
    const userStore=useUserStore()

    const trenutniSplitId=ref(null)
    const danPodatci=ref(null)
    const vjezbe=ref([])
    const loading=ref(false)

    const dohvatiSplit=async () =>{
        loading.value=true

        const userDocRef=doc(db, `users/${userStore.currentUser.uid}`)
        const userSnap = await getDoc(userDocRef)
        if(userSnap.exists()){
            trenutniSplitId.value=userSnap.data.trenutniSplit
        }
    }

    const dohvatiDan= async (id) =>{
        const splitRef= doc(db, `users/${userStore.currentUser.uid}/splits/${trenutniSplitId.value}`)
        const splitSnap= await getDoc(splitRef)
        if(splitSnap.exists()){
            const dan = splitSnap.data().dani[id]
            danPodatci.value=dan
            await dohvatiVjezbe(dan.vjezbe)
        }
    }

    const dohvatiVjezbe= async (id) =>{
        const rez=[]
        for(i of id){
            const vjezbaRef = doc(db, 'vjezbe', id)
            const vjezbaSnap= await getDoc(vjezbaRef)
            if(vjezbaSnap.exists()){
                rez.push({
                    id,
                    naziv: vjezbaSnap.data().naziv,
                    opis: vjezbaSnap.data().opis,
                    slika: vjezbaSnap.data().slika
                })
            }
        }
        vjezbe.value=rez
        loading.value=false
    }

    onMounted(async () => {
        await dohvatiSplit()
        await dohvatiDan(0)
    })

</script>

<template>
    <div v-if="!loading">
        dan
    </div>
</template>