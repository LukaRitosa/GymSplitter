<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore'
    import { db } from '@/firebase'
    import { useUserStore } from '@/stores/userStore'
    import { useRoute } from 'vue-router'
    import { RouterLink } from 'vue-router'

    

    const route = useRoute()
    const userStore = useUserStore()

    const props = defineProps({
        danId: {
            type: [Number, String],
            required: false
        }
    })

    const danId = Number(props.danId ?? route.params.danId)


    const trenutniSplitId = ref(null)
    const danPodaci = ref({})
    const vjezbe = ref([])
    const sveVježbe=ref([])

    const loading = ref(false)
    const detalji=ref(false)
    const promjena=ref(false)
    const izbornik=ref(false)

    const dohvatiSplit = async () => {
        try {
            loading.value = true

            const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
            const userSnap = await getDoc(userDocRef)
            if (userSnap.exists()) {
                trenutniSplitId.value = userSnap.data().trenutniSplit
            }
        } catch (error) {
            console.error("Greška pri dohvaćanju:", error)
        }
    }
    
    const dohvatiVjezbe = async (vjezbeIds) => {
        try {
            const rez = []
            for (const id of vjezbeIds) {
                let vjezbaRef = doc(db, 'vjezbe', id)
                let vjezbaSnap = await getDoc(vjezbaRef)
                
                if (!vjezbaSnap.exists()) {
                    vjezbaRef = doc(db, `users/${userStore.currentUser.uid}/customVjezbe`, id)
                    vjezbaSnap = await getDoc(vjezbaRef)
                }

                if (vjezbaSnap.exists()) {
                    rez.push({
                        id,
                        naziv: vjezbaSnap.data().naziv,
                        opis: vjezbaSnap.data().Opis,
                        slika: vjezbaSnap.data().slika,
                        glavni_misic: vjezbaSnap.data().glavni_misic,
                        ostali_misici: vjezbaSnap.data().ostali_misici || [],
                        brojSetova: danPodaci.value.setovi?.[id] || 1
                    })
                }
            }
            vjezbe.value = rez
        } catch (error) {
            console.error("Greška pri dohvaćanju vježbi:", error)
        } finally {
            loading.value = false
        }
    }

    const dohvatiDan = async () => {
        try {

            const splitRef = doc(db, `users/${userStore.currentUser.uid}/splits/${trenutniSplitId.value}`)
            const splitSnap = await getDoc(splitRef)
            if (splitSnap.exists()) {
                const splitData = splitSnap.data()
                
                const odabraniDan = splitData.dani?.find(d => Number(d.dan) === Number(danId))
                if (odabraniDan) {
                    danPodaci.value = odabraniDan
                    await dohvatiVjezbe(odabraniDan.vjezbe || [])
                }
            }
        } catch (error) {
            console.error("Greška pri dohvaćanju:", error)
        }
    }

    
    const dohvatiSveVjezbe= async () => {
        try{
            const sve=[]

            const globalSnap= await getDocs(collection(db, 'vjezbe'))
            
            globalSnap.forEach(docSnap => {
                sve.push({
                    id: docSnap.id,
                    ...docSnap.data()
                })
            })
            
            const customSnap= await getDocs(collection(db, `users/${userStore.currentUser.uid}/customVjezbe`))
                
            customSnap.forEach(docSnap => {
                sve.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                    custom: true
                })
            })
            
            sveVježbe.value=sve
        }
        catch (error){
            console.error("Greška pri dohvaćanju vježbi:", error)
        }
    }

    const grupiraneVjezbe= computed (() =>{
        const grupe={}
        sveVježbe.value.forEach(vjezba=>{
            if(!vjezbe.value.some(v => v.id===vjezba.id)) {
                if(!grupe[vjezba.glavni_misic]){
                    grupe[vjezba.glavni_misic]=[]
                }
                grupe[vjezba.glavni_misic].push(vjezba)
            }
        })
        return grupe
    })

    const grupiraneVjezbeUDanu = computed(() => {
        const grupe = {}
        vjezbe.value.forEach(v => {
            if (!grupe[v.glavni_misic]) {
                grupe[v.glavni_misic] = []
            }
            grupe[v.glavni_misic].push(v)
        })
        return grupe
    })

    const smanjiSetove = (vjezba) => {
        if (vjezba.brojSetova > 1) {
            vjezba.brojSetova--
            promjena.value = true
        }
    }

    const povecajSetove = (vjezba) => {
        vjezba.brojSetova++
        promjena.value = true
    }

    const spremiPromjene= async () =>{
        loading.value=true
        try{
            const splitRef = doc(db, `users/${userStore.currentUser.uid}/splits/${trenutniSplitId.value}`)
            const splitSnap = await getDoc(splitRef)

            if(splitSnap.exists()){
                const splitData=splitSnap.data()

                const promjenjenDan=splitData.dani.map(dan=>{
                    if(dan.dan===danId){
                        const promjenjeniSetovi={}
                        vjezbe.value.forEach(v=>{
                            promjenjeniSetovi[v.id]=v.brojSetova
                        })

                        return{
                            ...dan,
                            setovi: promjenjeniSetovi
                        }    
                    }

                    return dan
                })

                await updateDoc(splitRef, {
                    dani: promjenjenDan
                })
            }
        promjena.value=false
        }
        catch (error){
            console.error("Greška pri spremanju:", error)
        } finally {
            loading.value = false
        }
    }

    const dodajVjezbu= async (novaVjezba) =>{
        try{
            loading.value=true

            vjezbe.value.push({
                id: novaVjezba.id,
                naziv: novaVjezba.naziv,
                opis: novaVjezba.Opis,
                slika: novaVjezba.slika,
                glavni_misic: novaVjezba.glavni_misic,
                ostali_misici: novaVjezba.ostali_misici || [],
                brojSetova: 1
            })

            const splitRef= doc(db, `users/${userStore.currentUser.uid}/splits/${trenutniSplitId.value}`)
            const splitSnap = await getDoc(splitRef)

            const splitData=splitSnap.data()

            const promjeniDan=splitData.dani.map(dan =>{
                if(Number(dan.dan) === Number(danId)){
                    return{
                        ...dan,
                        vjezbe: [...(dan.vjezbe || []), novaVjezba.id],
                        setovi: {...(dan.setovi || {}), [novaVjezba.id]: 1}
                    }
                }
                return dan
            })

            await updateDoc(splitRef, {
                dani: promjeniDan
            })
                
        } catch (error) {
            console.error("Greška pri dodavanju:", error)
        } finally {
            loading.value = false
            izbornik.value=false
        }
    }

    const ukloniVjezbu= async (vjezba) =>{
        try{
            loading.value= true

            vjezbe.value= vjezbe.value.filter(v => v.id!==vjezba)

            const splitRef= doc(db, `users/${userStore.currentUser.uid}/splits/${trenutniSplitId.value}`)
            const splitSnap= await getDoc(splitRef)

            if (!splitSnap.exists()) {
                console.error("Split ne postoji")
                return
            }

            const splitData= splitSnap.data()

            const promjeniDan= splitData.dani.map(dan => {
                if (Number(dan.dan) === Number(danId)){
                    const noveVjezbe = { 
                        ...(dan.setovi || {}) 
                    }
                    delete noveVjezbe[vjezba]

                    return {
                        ...dan,
                        vjezbe: (dan.vjezbe || []).filter(id => id !== vjezba),
                        setovi: noveVjezbe
                    }

                }
                return dan
            })

            await updateDoc(splitRef, {
                dani: promjeniDan
            })
        } catch (error) {
            console.error("Greška pri uklanjanju:", error)
        } finally {
            loading.value = false
        }
    }

    onMounted(async () => {
        await dohvatiSplit()
        await dohvatiDan()
        await dohvatiSveVjezbe()
    })
</script>

<template>
    
    <div v-if="loading" class="min-h-screen flex flex-col items-center px-4 justify-center">
        <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif"/>
    </div>

    <div v-if="!loading && !izbornik" class="flex justify-center items-center min-h-screen flex-col font-semibold">
        
        <div class="m-4">
            <RouterLink to="/pocetna" class="w-full bg-black text-white rounded hover:bg-red-300 p-2"> Početna</RouterLink>
        </div>

        <h2 class="text-2xl font-bold mb-4">
            {{ danPodaci.naziv || 'Nepoznat dan' }}
        </h2>

        <button class="border bg-red-600 text-white hover:bg-red-300 p-2 rounded" @click="izbornik=true">
            Dodaj vježbu
        </button>
        
        <div v-for="(grupa, misic) in grupiraneVjezbeUDanu" :key="misic" class="mb-6">
            <h3 class="text-xl font-bold mb-2">{{ misic }}</h3>

            <div class="flex gap-4">
                <div v-for="v in grupa" :key="v.id"
                 class="w-60 text-center flex flex-col items-center border border-red-700 rounded p-4">

                    <h4 class="font-semibold">{{ v.naziv }}</h4>

                    <img :src="v.slika" :alt="v.naziv" class="my-2 w-max-50 h-auto rounded">

                    <div class="mt-2 w-full">
                        <div v-if="detalji" @click="detalji=false">
                            <p class="text-gray-700">
                                {{ v.opis }}
                            </p>    
                            <p>
                                <b> Glavni mišić: </b> {{ v.glavni_misic }}
                            </p>
                            <p v-if="v.ostali_misici.length">
                                <b>Ostali mišići: </b> {{ v.ostali_misici.join(', ') }}
                            </p>
                        </div>

                        <p class="mt-2 flex items-center justify-center gap-2">
                            <button class="border bg-red-500 text-white hover:bg-red-300 px-2 rounded" @click="smanjiSetove(v)">
                                -
                            </button>

                            {{ v.brojSetova }}

                            <button class="border bg-red-500 text-white hover:bg-red-300 px-2 rounded" @click="povecajSetove(v)">
                                +
                            </button>
                            
                        </p>

                        <button class="mt-2 border bg-black text-white hover:bg-red-800 p-3 rounded" @click="ukloniVjezbu(v.id)">
                            Ukloni vježbu
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <button v-if="promjena" class="border bg-black text-white hover:bg-red-500 p-2 rounded" @click="spremiPromjene">
            Spremi promjene
        </button>

        <button class="border bg-red-700 text-white hover:bg-red-300 p-2 rounded" @click="detalji=true" v-if="!detalji">
            Prikaži detalje
        </button>

        <button class="border bg-red-700 text-white hover:bg-red-300 p-2 rounded" @click="detalji=false" v-else>
            Sakrij detalje
        </button>


    </div>

    <div v-if="izbornik && !loading" class="flex justify-center items-center min-h-screen flex-col font-semibold">
        <h3 class="text-2xl font-bold mb-4">
            Odaberi vježbe
        </h3>

        <div class="flex gap-3 mb-6">
            <button class="border bg-gray-500 text-white hover:bg-red-300 p-2 rounded" @click="izbornik=false">
                Nazad
            </button>

            <RouterLink to="/UserVjezbaMaker" class="border bg-red-500 text-white hover:bg-red-300 p-2 rounded">
                Dodaj vlastitu
            </RouterLink>
        </div>

        <div v-for="(grupa, misic) in grupiraneVjezbe" :key="misic" class="mb-8 w-full text-center">
            <h4 class="text-xl font-bold mb-2">{{ misic }}</h4>

            <div class="flex gap-4 justify-center p-2">
                <div v-for="v in grupa" :key="v.id" @click="dodajVjezbu(v)"
                    class="w-60 text-center flex flex-col items-center border rounded p-4 hover:bg-red-200">
                    
                    <h5 class="font-semibold">
                        {{ v.naziv }}
                    </h5>
                    <img :src="v.slika" class="my-2 w-50 h-auto rounded">
                </div>
            </div>
        </div>

    </div>



  

</template>