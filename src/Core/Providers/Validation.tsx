import * as React from 'react'

interface IValidationContext {
  clientValidationMessages: string[]
  updateClientValidationMessages: (messages: string[]) => void
}

const ValidationContext = React.createContext<IValidationContext>({
  clientValidationMessages: [],
  updateClientValidationMessages: () => {}
})

export const ValidationProvider = (props) => {
  const [clientValidationMessages, updateClientValidationMessages] = React.useState([])

  return (
    <ValidationContext.Provider value={{
      clientValidationMessages,
      updateClientValidationMessages: (messages: string[]) => {
        updateClientValidationMessages(messages)
      }
    }}>
      {props.children}
    </ValidationContext.Provider>
  )
}

export function useValidation(): [string[], (messages: string[]) => void] {
  const { clientValidationMessages, updateClientValidationMessages } = React.useContext(ValidationContext)
  return [clientValidationMessages, updateClientValidationMessages]
}
