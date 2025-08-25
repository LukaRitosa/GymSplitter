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
            tekst:"Koliko iskustva treniranja u teretani imaš?",
            odgovori: [
                "Nikad nisam.",
                "Manje od 3 mjeseca.",
                "1-2 godine.",
                "3-5 godina.",
                "5+ godina.",        
            ],
            tip: 'radio' 
        },
       {
            tekst: "Koji su ti slobodni dani?",
            odgovori: dani_u_tjednu,
            tip: 'checkbox'
        },
    ]

    const brojSlobodnihDana = computed(() => {
        return odgovori.value[1].length
    })

    const posaljiOdgovore = async () => {
        const user= userStore.currentUser

        try{
            await updateDoc(doc(db, "users", user.uid), {
                iskustvo: odgovori.value[0],
                slobodni_dani: odgovori.value[1],
                slobodnoVrijeme: `${brojSlobodnihDana.value} ${brojSlobodnihDana.value===1 ? 'dan' : 'dana'}`
            })
            router.push("/pocetna")
        }
        catch (error) {
            console.error("Greška pri spremanju:", error)
            alert("Došlo je do greške.")
        }
    }    


    const odgovori = ref({
        0: null, 
        1: []  
    })


</script>

<template>


        <div>
            <h3>{{ pitanja[0].tekst }}</h3>
            <div v-for="(odgovor) in pitanja[0].odgovori">
                <input type="radio" v-model="odgovori[0]" :value="odgovor" :name="'pitanje0'"/>
                <label>{{ odgovor }}</label>
            </div>
        </div>

        <div>
            <h3>{{ pitanja[1].tekst }}</h3>
            <p>Odabrano dana: {{ brojSlobodnihDana }}</p>
            <div v-for="(dan, idx) in pitanja[1].odgovori">
                <input type="checkbox" v-model="odgovori[1]" :value="dan"/>
                <label :for="'dan_' + idx">{{ dan }}</label>
            </div>
        </div>


    <button class="w-full bg-red-800 text-white rounded hover:bg-red-600 p-2 font-semibold" @click="posaljiOdgovore">
        Pošalji odgovor
    </button>


</template>