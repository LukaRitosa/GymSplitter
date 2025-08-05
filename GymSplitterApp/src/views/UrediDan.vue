<script setup>
    import { ref, onMounted } from 'vue'
    import { doc, getDoc} from 'firebase/firestore'
    import { db } from '@/firebase'
    import { useUserStore } from '@/stores/userStore'
    import { useRoute } from 'vue-router'

    const route= useRoute()
    const userStore=useUserStore()

    const danId = Number(route.params.danId)
    const trenutniSplitId=ref(null)
    const danPodatci=ref(null)
    const vjezbe=ref([])
    const loading=ref(false)

    const dohvatiSplit=async () =>{
        loading.value=true

        const userDocRef=doc(db, `users/${userStore.currentUser.uid}`)
        const userSnap = await getDoc(userDocRef)
        if(userSnap.exists()){
            trenutniSplitId.value=userSnap.data().trenutniSplit
        }
    }

    const dohvatiDan= async (id) =>{
        const splitRef= doc(db, `users/${userStore.currentUser.uid}/splits/${trenutniSplitId.value}`)
        const splitSnap= await getDoc(splitRef)
        if(splitSnap.exists()){
            const dan = splitSnap.data()
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
                    opis: vjezbaSnap.data().Opis,
                    slika: vjezbaSnap.data().slika,
                    glavni_misic:vjezbaSnap.data().glavni_misic,
                    
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
        <h2>{{ danPodaci.naziv }}</h2>
        <li v-for="v in vjezbeDetalji" :key="v.id">
            {{ v.naziv }}
            <img :src="v.slika">
        </li>
    </div>

    <div v-else>
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
    </div>
</template>