<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore'
    import { db } from '@/firebase'
    import { useUserStore } from '@/stores/userStore'
    import { useRoute } from 'vue-router'
    

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
    <div class="flex">
        
        <div v-if="loading">
            <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif"/>
        </div>

        <div v-if="!loading && !izbornik">
            <h2 class="text-xl font-bold mb-4">{{ danPodaci.naziv || 'Nepoznat dan' }}</h2>
            
            <ul class="space-y-4">
            <div v-for="(grupa, misic) in grupiraneVjezbeUDanu" :key="misic" class="mb-6" @click="detalji=true">
                <h3 class="text-lg font-bold mb-2">{{ misic }}</h3>
                <div v-for="v in grupa" :key="v.id" class="border rounded-lg p-3">
                    <h4 class="font-semibold">{{ v.naziv }}</h4>
                    <img :src="v.slika" :alt="v.naziv" class="my-2 w-50 h-auto rounded">
                    <div class="mt-2">

                        <div v-if="detalji" @click="detalji=false">
                            <p class="text-gray-700">{{ v.opis }}</p>    

                            <p>Glavni mišić: {{ v.glavni_misic }}</p>
                            <p v-if="v.ostali_misici?.length">
                                Ostali mišići: {{ v.ostali_misici.join(', ') }}
                            </p>
                        </div>

                        <p class="mt-2 font-medium">
                            Broj setova: 
                            <button class="border bg-red-500 text-white hover:bg-red-300 p-2" @click="smanjiSetove(v)">
                                -
                            </button>
                            {{ v.brojSetova }}
                            <button class="border bg-red-500 text-white hover:bg-red-300 p-2" @click="povecajSetove(v)">
                                +
                            </button>
                        </p>
                        <button class="border bg-black text-white hover:bg-red-800 p-2"
                        @click="ukloniVjezbu(v.id)">
                            Ukloni vježbu
                        </button>
                    </div>
                </div>
            </div>
            <button class="border bg-blue-500 text-white hover:bg-blue-300 p-2" @click="izbornik=true">
                dodaj vježbu
            </button>
            </ul>
            <button v-if="promjena" class="border bg-red-500 text-white hover:bg-red-300 p-2" @click="spremiPromjene">
                spremi promjene
            </button>
        </div>

        <div v-if="izbornik && !loading">
            <div>
                <h3 class="text-xl font-bold mb-4">Odaberi vježbe</h3>

                <RouterLink to="/UserVjezbaMaker" class="border bg-red-500 text-white hover:bg-red-300 p-2">
                    Dodaj vlastitu
                </RouterLink>

                <div v-for="(grupa, misic) in grupiraneVjezbe">
                    <h4 class="font-bold"> {{ misic }}</h4>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        <div v-for="v in grupa" :key="v.id" class="border p-3 rounded cursor-pointer hover:bg-gray-50"
                        @click="dodajVjezbu(v)">
                            <img :src="v.slika" class="w-full h-24 object-cover mb-2">
                            <p class="font-medium">{{ v.naziv }}</p>
                        </div>
                    </div>
                </div>

                <button @click="izbornik = false" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
                    Zatvori
                </button>  
            </div>
        </div>

    </div>
  

</template>