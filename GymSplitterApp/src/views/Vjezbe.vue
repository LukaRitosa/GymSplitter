<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

const vjezbe = ref([])

onMounted(async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "vjezbe"))
    vjezbe.value = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      ostaliMisici: doc.data().ostaliMisici || []
    }))
  } catch (error) {
    console.error("Greška:", error)
  }
})
</script>

<template>
    <div v-for="v in vjezbe" :key="v.id" class="p-2 border-b">
        <h2 class="font-bold">{{ v.naziv }}</h2>
        <img :src="v.slika" alt="" class="w-32 h-auto my-2" v-if="v.slika"/>
        <p><b>Opis:</b> {{ v.Opis }}</p>
        <p><b>Glavni mišić:</b> {{ v.glavni_misic }}</p>
        <p><b>Ostali mišići:</b> {{ v.ostali_misici.join(', ') }}</p>
    </div>
</template>