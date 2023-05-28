import { View, Text, Button } from 'react-native'
import React, {useEffect, useState,} from 'react'
import notifee, {AuthorizationStatus, EventType, AndroidImportance, TriggerType, RepeatFrequency} from '@notifee/react-native'
export default function App() {
  const [statusNotification, setStatusNotification] = useState(true)

  useEffect(() => {
    async function getPermissions(){
      const settings = await notifee.requestPermission();
      if(settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED){
        console.log(settings.authorizationStatus);
        setStatusNotification(true)
      } else {
        console.warn('usuario  negou');
        setStatusNotification(false)
      }
    }
    getPermissions()
  }, [])

  useEffect(() => {
    return notifee.onForegroundEvent(({type, detail}) => {
      switch(type){
        case EventType.DISMISSED:
          console.log('notify descartada');
          break
        case EventType.PRESS:
          console.log(detail.notification);
          
      }
    })
  }, [])

 async function sendNotification(){
  if(!statusNotification) return 

  const channelId = notifee.createChannel({
    id: 'lembrete',
    name: 'lembrete',
    vibration: true,
    importance: AndroidImportance.HIGH
  })

  await notifee.displayNotification({id: 'lembrete', title: 'estudar vagabundo', body: 'estuda rn amanha', android: {
    channelId: 'lembrete',
    pressAction: {
      id: 'default'
    }
  }})
  }

  notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail

    if (type = EventType.PRESS){
      console.log('tocou!');
      if(notification?.id){
        await notifee.cancelNotification(notification.id)
      }
    }
  })

  async function sendBackGroundNotification(){ 
    const date = new Date(Date.now())
    date.setMinutes(date.getMinutes() + 1);

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime()
    }

    await notifee.createTriggerNotification({
      title: 'vai',
      body: 'Estude!',
      android: {
        channelId: 'lembrete',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default'
        }
      }
    }, trigger)
  }

  async function cancelNotify(){
    await notifee.cancelAllNotifications()
  }

  function listNotifications(){
    notifee.getTriggerNotificationIds()
    .then((ids) => console.log(ids))
  }

  async function weeklyNotify(){
    const date = new Date(Date.now())

    date.setMinutes(date.getMinutes() + 1)


    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.WEEKLY
    }

    await notifee.createTriggerNotification({
      title: 'lembrete semanal',
      body: 'semanal',
      android: {
        channelId: 'lembrete',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default'
        }
      }
    }, trigger)
  }



  return (
    <View>
      <Text>App</Text>
      <Button 
      title='notify'
      onPress={ sendNotification}/>
      <Button 
      title='agendar notify'
      onPress={ sendBackGroundNotification}/>
      <Button 
      title='listar notify'
      onPress={ listNotifications}/>
      <Button 
      title='cancelar todas as notifys'
      onPress={ cancelNotify}/>
      <Button 
      title='agendar notify semanal'
      onPress={ weeklyNotify}/>
    </View>
  )
}