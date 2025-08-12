<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useRouter } from 'vue-router'

    const router = useRouter()
    const dani_u_tjednu=[
        'Ponedjeljak',  'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja', 
    ]
    const tjedni=ref([])


    const generirajKalendar= () =>{
        const danas= new Date()
        const kalendar=[]

        for (let i=0; i<14; i++){
            const datum= new Date(danas)
            datum.setDate(danas.getDate() + i)

            kalendar.push({
                datum: datum, 
                dan_u_tjednu: dani_u_tjednu[datum.getDay() === 0 ? 6 : datum.getDay() - 1], //nedjelja ima index 0 u jeziku
                dan_u_mjesecu: datum.getDate(),
                mjesec: datum.getMonth() + 1,
                godina: datum.getFullYear()
            })
        }
        const tjedniGrupirani=[]

        for (let i = 0; i < 7; i++) {
            tjedniGrupirani.push({
                dan: dani_u_tjednu[i],
                datumi: kalendar.filter(d => d.dan_u_tjednu === dani_u_tjednu[i])
            })
        }
        tjedni.value=tjedniGrupirani
    }

    const formatDatum = (datum) => {
       return `${datum.danUMjesecu}.${datum.mjesec}.${datum.godina}`
    }


    onMounted(() =>{
        generirajKalendar()
    })

</script>

<template>
    <div>
        <h3 class="text-xl font-bold">Kalendar</h3>

        <div class="grid grid-cols-7 gap-2">
            <div v-for="dan in tjedni" class="text-center font-bold py-2 border-b">            
                <div v-for="datum in dan.datumi" :key="formatDatum(datum)" class="p-2 border rounded cursor-pointer hover:bg-gray-100 text-center">
                    {{ datum.dan_u_mjesecu }}.{{ datum.mjesec }}.
                    <div class="text-xs text-gray-500 mt-1">
                        {{ datum.dan_u_tjednu.substring(0, 3) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>