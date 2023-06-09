<script setup>
import { Observer } from 'mobx-vue-lite'
import { MessagesPresenter } from './MessagesPresenter'
{/*import { withInjection } from '../Providers/Injection'*/}
{/*import { useValidation } from '../Providers/Validation'*/}
// const [uiMessages] = useValidation()

import { container } from '@/AppIOC.ts'

const presenter = container.get(MessagesPresenter);
</script>
<template>
  <Observer>
    <div v-for="message in presenter.messages" :style="{ backgroundColor: 'red'}">
    --
    {{message}}
    </div>
  </Observer>
<!--      {props.presenter.messag=es &&-->
<!--        props.presenter.messages.map((item, i) => {-->
<!--          return (-->
<!--            <div style={{ backgroundColor: 'red' }} key={i}>-->
<!--              {' - '}-->
<!--              {item}-->
<!--            </div>-->
<!--          )-->
<!--        })}-->
<!--      {uiMessages &&-->
<!--        uiMessages.map((item, i) => {-->
<!--          return (-->
<!--            <div style={{ backgroundColor: 'orange' }} key={i}>-->
<!--              {' - '}-->
<!--              {item}-->
<!--            </div>-->
<!--          )-->
<!--        })}-->
</template>
