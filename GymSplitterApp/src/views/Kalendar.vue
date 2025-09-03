<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { doc, getDoc, updateDoc } from 'firebase/firestore'
    import { db } from '@/firebase'
    import { useUserStore } from '@/stores/userStore'

    const router = useRouter()
    const userStore = useUserStore()
    const kalendar_podaci = ref({})
    const loading = ref(false)
    const edit=ref(false)

    const dani_u_tjednu=[
        'Nedjelja', 'Ponedjeljak',  'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota',  
    ]

    const tjedni=ref([])



    const generirajKalendar = () => {
        loading.value = true
        const danas = new Date()
        const kalendar = []
    

        for (let i = 0; i < 14; i++) {
            const datum = new Date(danas)
            datum.setDate(danas.getDate() + i)

            kalendar.push({
                datum: datum,
                id: formatDateKey(datum),
                dan_u_tjednu: dani_u_tjednu[datum.getDay()], 
                dan_u_mjesecu: datum.getDate(),
                mjesec: datum.getMonth() + 1,
                godina: datum.getFullYear(),
                tjedan: Math.floor(i / 7) + 1,
            })
        }
    
        tjedni.value = kalendar;

    }


    function formatDateKey(datum) {
        const year = datum.getFullYear()
        const month = String(datum.getMonth() + 1).padStart(2, '0')
        const day = String(datum.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const dohvatiKalendar = async () => {
        try {

            const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
            const userDocSnap = await getDoc(userDocRef)

            const data = userDocSnap.data()
                
            const splitDocRef = doc(db, `users/${userStore.currentUser.uid}/splits/${data.trenutniSplit}`)
            const splitSnap = await getDoc(splitDocRef)
            
            if (splitSnap.exists()) {
                kalendar_podaci.value = splitSnap.data().kalendar || {}
            }

        } catch (error) {
            console.error("Greška pri dohvaćanju kalendara:", error)
        } finally {
            loading.value = false
        }
    }

    const getTreningZaDatum = (datum) => {
        return kalendar_podaci.value[datum] || { naziv: 'Odmor', split_dan_id: null }
    }


    const postaviOdmor = async (kliknutiDan) => {
        loading.value = true
        try {

            const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
            const userDocSnap = await getDoc(userDocRef)
            if (!userDocSnap.exists()) return
            
            const data = userDocSnap.data()

            const splitDocRef = doc(db, `users/${userStore.currentUser.uid}/splits/${data.trenutniSplit}`)
            const snap = await getDoc(splitDocRef)
            if (!snap.exists()) return

            const userData = snap.data()

            const original = { ...(userData.kalendar || {}) } 
            const kalendar = { ...original }


            const sviDani = Object.keys(kalendar).sort((a, b) => new Date(a) - new Date(b))

            
            const idx = sviDani.indexOf(kliknutiDan)

            if(idx===-1) return
            

            const radniDani = sviDani.slice(idx).filter(d => kalendar[d].split_dan_id !== null || d === kliknutiDan)

            

            if (radniDani.length === 0) return

            let lastValid = {
                split_dan_id: original[kliknutiDan].split_dan_id,
                naziv: original[kliknutiDan].naziv
            }

            for (let i = 1; i < radniDani.length; i++) {
                const trenutni = radniDani[i]

                kalendar[trenutni] = {
                    ...kalendar[trenutni],
                    split_dan_id: lastValid.split_dan_id,
                    naziv: lastValid.naziv
                }

                lastValid={
                    split_dan_id: original[trenutni].split_dan_id,
                    naziv: original[trenutni].naziv
                }

            }
            
            kalendar[kliknutiDan] = {
                ...kalendar[kliknutiDan],
                split_dan_id: null,
                naziv: "Odmor"
            }


            await updateDoc(splitDocRef, { kalendar })
            kalendar_podaci.value = kalendar

        } catch (e) {            
            console.error('Greška:', e)

        } finally {
            loading.value = false
        }
    }


    const preskoci= async (kliknutiDan) =>{
        loading.value=true
        try{

            const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
            const userDocSnap = await getDoc(userDocRef)
            if (!userDocSnap.exists()) return
            
            const data = userDocSnap.data()

            const splitDocRef = doc(db, `users/${userStore.currentUser.uid}/splits/${data.trenutniSplit}`)
            const snap = await getDoc(splitDocRef)
            if (!snap.exists()) return

            const userData = snap.data()
            const kalendar = { ...(userData.kalendar || {}) }

            const sviDani = Object.keys(kalendar).sort((a, b) => new Date(a) - new Date(b))

            const idx = sviDani.indexOf(kliknutiDan)
            let sljedeciDan = null
            for (let i = idx + 1; i < sviDani.length; i++) {
                if (kalendar[sviDani[i]].split_dan_id !== null) {
                    sljedeciDan = sviDani[i]
                    break
                }
            }

            if (sljedeciDan === null) {
                loading.value = false
                return
            }

            const temp = { ...kalendar[kliknutiDan] }
            kalendar[kliknutiDan] = { ...kalendar[sljedeciDan] }
            kalendar[sljedeciDan] = temp

            await updateDoc(splitDocRef, { kalendar })
            kalendar_podaci.value = kalendar

        } catch (e) {
            console.error('Greška preskakanja:', e)

        } finally {
            loading.value = false
        }
    }


    const otkaziOdmor= async (kliknutiDan) =>{
        loading.value=true
        try{

            const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
            const userDocSnap = await getDoc(userDocRef)
            if (!userDocSnap.exists()) return
            
            const data = userDocSnap.data()

            const splitDocRef = doc(db, `users/${userStore.currentUser.uid}/splits/${data.trenutniSplit}`)
            const snap = await getDoc(splitDocRef)
            if (!snap.exists()) return

            const userData = snap.data()
            const original = { ...(userData.kalendar || {}) }
            const kalendar = { ...(userData.kalendar || {}) }

            if (!kalendar[kliknutiDan]) return

            const sviDani = Object.keys(kalendar).sort((a, b) => new Date(a) - new Date(b))

            const radniDani = sviDani.filter(d => original[d].split_dan_id !== null)

            const prvi_poslje= sviDani.find(d=> d> kliknutiDan && original[d].split_dan_id!==null)

            if (!prvi_poslje) {
                loading.value = false
                return
            }

            const originalniId = radniDani.map(d => original[d].split_dan_id)

            const prvi_id=original[prvi_poslje].split_dan_id
            const prvi_naziv=original[prvi_poslje].naziv || String(prvi_id)

            kalendar[kliknutiDan] = {
                ...kalendar[kliknutiDan],
                split_dan_id: prvi_id,
                naziv: prvi_naziv,
            }

            const startPoz=radniDani.indexOf(prvi_poslje)

            for(let i= startPoz; i< radniDani.length; i++){
                const trenutniDan=radniDani[i]
                let noviId, noviNaziv

                if(i+1<originalniId.length){
                    noviId=originalniId[i+1] 
                    noviNaziv=Object.values(original).find(d=>d.split_dan_id ===noviId)?.naziv || String(noviId)
                }
                else {
                    const zadnjiId = originalniId[i]

                    const zadnjiIndex = userData.dani.findIndex(d => d.dan === zadnjiId)

                    const sljedeciIndex = (zadnjiIndex + 1) % userData.broj_dana

                    noviId = userData.dani[sljedeciIndex].dan
                    noviNaziv = userData.dani[sljedeciIndex].naziv
                }


                kalendar[trenutniDan]={
                    ...kalendar[trenutniDan],
                    split_dan_id: noviId,
                    naziv: noviNaziv
                }
            }

            await updateDoc(splitDocRef, {kalendar})
            kalendar_podaci.value=kalendar

        } catch(error){
            console.error("Greška otkazivanja odmora:", error)

        } finally{
            loading.value=false
        }
    }

    const idiNaDan=(id)=>{
        if (id !== null) {
            router.push(`/UrediDan/${id}`)
        }
    }

    const odrzavajKalendar= async () =>{
        loading.value=true
        try{
            const userDocRef = doc(db, `users/${userStore.currentUser.uid}`)
            const userDocSnap = await getDoc(userDocRef)
            if (!userDocSnap.exists()) return
            
            const data = userDocSnap.data()
            const slobodni_dani=data.slobodni_dani


            const splitDocRef = doc(db, `users/${userStore.currentUser.uid}/splits/${data.trenutniSplit}`)
            const snap = await getDoc(splitDocRef)
            if (!snap.exists()) return

            const split = snap.data()
            const kalendar = { ...(split.kalendar || {}) }
            const split_dani={...(split.dani || {})}
            const split_broj_dana=split.broj_dana



            const danas=formatDateKey(new Date)
            let brojac=0
            

            const sviDani = Object.keys(kalendar).sort((a, b) => new Date(a) - new Date(b))
            if (sviDani.length === 0) return

            const radniDani = sviDani.filter(d => kalendar[d].split_dan_id !== null)

            let zadnji_datum_id=null
            for (const dan of radniDani) {
                zadnji_datum_id = dan
            }


            let zadnji_split_dan=kalendar[zadnji_datum_id].split_dan_id

            let zadnji_datum=null
            for(const dan of sviDani){
                if(new Date(dan) < new Date(danas)){
                    brojac++

                    delete kalendar[dan]
                }
                zadnji_datum=new Date(dan)
            }

            if(brojac===0){
                return
            }

            if(brojac===14){
                for(let i=0; i<14; i++){
                    const datum = new Date(danas)
                    datum.setDate(danas.getDate() + i)
                    const datumISO = datum.toLocaleDateString("sv-SE") 
                    const danUTjednu = datum.toLocaleDateString("hr-HR", { weekday: "long" })

                    zadnji_split_dan=(zadnji_split_dan + 1)  % split_broj_dana
                    
                    
                    if(slobodni_dani[danUTjednu]){
                        kalendar[datumISO]={
                            split_dan_id: split_dani[zadnji_split_dan].dan,
                            naziv: split_dani[zadnji_split_dan].naziv
                        }
                    }
                    else{
                        kalendar[datumISO]={
                            split_dan_id: null,
                            naziv: "Odmor"
                        }
                    }
                }
            }

            else{
                for(let i=1; i<=brojac; i++){
                    zadnji_datum=new Date(zadnji_datum)
                    zadnji_datum.setDate(zadnji_datum.getDate()+1)
                    const datumISO = zadnji_datum.toLocaleDateString("sv-SE") 
                    const danUTjednu = zadnji_datum.toLocaleDateString("hr-HR", { weekday: "long" })
                    
                    
                    
                    if(i!==1){
                        zadnji_split_dan=(zadnji_split_dan + 1) % split_broj_dana
                    }
                    if(i===1 && zadnji_split_dan===split_broj_dana){
                        zadnji_split_dan=0
                    }

                    if(slobodni_dani.includes(danUTjednu)){
                        kalendar[datumISO]={
                            split_dan_id: split_dani[zadnji_split_dan].dan,
                            naziv: split_dani[zadnji_split_dan].naziv
                        }
                    }
                    else{
                        kalendar[datumISO]={
                            split_dan_id: null,
                            naziv: "Odmor"
                        }
                    }
                }
            }


            await updateDoc(splitDocRef, { kalendar })
            kalendar_podaci.value = kalendar
            
        } catch(error){
            console.error("Greška pri održavanju datuma", error)
        } finally{
            loading.value=false
        }
    }


    onMounted(async () => {
        generirajKalendar()
        await dohvatiKalendar()
        odrzavajKalendar()
    })


</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-red-900 px-4">
        
        <div v-if="loading">
            <img src="https://static.wixstatic.com/media/68315b_30dbad1140034a3da3c59278654e1655~mv2.gif" class="h-full" />
        </div>



        <div v-else class="overflow-x-auto">

            <div class=" my-4">
                <RouterLink to="/pocetna" class="w-full bg-red-400 text-white hover:bg-red-300 p-2 font-semibold rounded"> Početna</RouterLink>
            </div>

            <h3 class="text-3xl font-bold my-4">Kalendar</h3>

            <div class="grid grid-cols-7 gap-2 min-w-max grid-red-7 my-4">
                <div v-for="(datum, index) in tjedni" class="text-center border border-red-700">           
                    <div class="font-bold py-2 border-b sticky top-0 bg-red-800 text-gray-100">
                        {{ datum.dan_u_tjednu }}
                    </div>
                    <div class="text-sm font-medium bg-white">
                        {{ datum.dan_u_mjesecu }}.{{ datum.mjesec }}.
                    </div>
                    <div v-if="getTreningZaDatum(datum.id).split_dan_id !== null" 
                            class="mt-1 text-xs font-semibold p-1 rounded bg-white bg-opacity-70">
                        {{ getTreningZaDatum(datum.id).naziv }}

                        <div v-if="edit">
                            <button class="border bg-gray-500 text-white hover:bg-gray-300 p-2 rounded" @click="postaviOdmor(datum.id)">
                                Odmor
                            </button>
                        </div>

                        <div v-if="edit">
                            <button class="border bg-red-600 text-white hover:bg-red-300 p-2 rounded" @click="preskoci(datum.id)">
                                Preskoči
                            </button>
                        </div>

                        <div v-else @click="idiNaDan(getTreningZaDatum(datum.id).split_dan_id)">
                            <button class="border bg-red-800 text-white hover:bg-red-500 p-2 rounded">
                                Idi na dan
                            </button>    
                        </div>
                        
                        
                        
                    </div>

                    <div v-else class="mt-1 text-xs text-gray-500">
                        Odmor
                        <div>
                            <button class="border bg-blue-500 text-white hover:bg-blue-300 p-2 rounded" @click="otkaziOdmor(datum.id)" v-if="edit">
                                Otkaži odmor
                            </button> 
                        </div>
                        
                    </div>
                </div>
            </div>

            <button @click="edit=true" class="border bg-red-500 text-white hover:bg-red-300 p-2 rounded" v-if="!edit">
                Edit mode
            </button>

            <button @click="edit=false" class="border bg-red-500 text-white hover:bg-red-300 p-2 rounded" v-else>
                Izađi iz edit mode
            </button>


        </div> 
    </div>

</template>