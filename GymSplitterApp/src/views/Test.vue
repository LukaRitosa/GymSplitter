<script setup>
    import { RouterLink, useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/userStore'
    import { ref, computed } from 'vue'
    import { updateDoc, doc } from "firebase/firestore"
    import { db } from '@/firebase' 



    const router=useRouter()
    const userStore=useUserStore()

    const dani_u_tjednu=[
        'ponedjeljak',  'utorak', 'srijeda', 'četvrtak', 'petak', 'subota', 'nedjelja', 
    ]

    const pitanja=[
       {
            tekst: "Koji su ti slobodni dani?",
            odgovori: dani_u_tjednu,
            tip: 'checkbox'
        },
    ]

    const brojSlobodnihDana = computed(() => {
        return odgovori.value.length
    })

    const posaljiOdgovore = async () => {
        const user= userStore.currentUser

        try{
            await updateDoc(doc(db, "users", user.uid), {
                slobodni_dani: odgovori.value,
                slobodnoVrijeme: `${brojSlobodnihDana.value} ${brojSlobodnihDana.value===1 ? 'dan' : 'dana'}`
            })
            router.push("/pocetna")
        }
        catch (error) {
            console.error("Greška pri spremanju:", error)
            alert("Došlo je do greške.")
        }
    }    


    const odgovori= ref([])


</script>

<template>


        <div v-for="p in pitanja">
            <h3>{{ p.tekst }}</h3>
            <p>Odabrano dana: {{ brojSlobodnihDana }}</p>
            <div v-for="(dan, idx) in p.odgovori">
                <input type="checkbox" v-model="odgovori" :value="dan"/>
                <label :for="'dan_' + idx">{{ dan }}</label>
            </div>
        </div>


    <button class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold" @click="posaljiOdgovore">
        Pošalji odgovor
    </button>


</template>