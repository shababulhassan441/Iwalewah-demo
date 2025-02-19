// components/common/modal/modal.context.tsx

import React, { createContext, useContext, useReducer, ReactNode } from 'react';


type MODAL_VIEWS =
  | 'SIGN_UP_VIEW'
  | 'LOGIN_VIEW'
  | 'FORGET_PASSWORD'
  | 'PAYMENT'
  | 'ADDRESS_VIEW_AND_EDIT'
  | 'PHONE_NUMBER'
  | 'DELIVERY_VIEW'
  | 'PRODUCT_VIEW'
  | 'CATEGORY_VIEW'
  | 'RESET_PASSWORD'; // Added RESET_PASSWORD

interface State {
  view?: MODAL_VIEWS;
  data?: any;
  isOpen: boolean;
}

type Action =
  | { type: 'open'; view?: MODAL_VIEWS; payload?: any }
  | { type: 'close' };

const initialState: State = {
  view: undefined,
  isOpen: false,
  data: null,
};

function modalReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'open':
      return {
        ...state,
        view: action.view,
        data: action.payload,
        isOpen: true,
      };
    case 'close':
      return {
        ...state,
        view: undefined,
        data: null,
        isOpen: false,
      };
    default:
      throw new Error('Unknown Modal Action!');
  }
}

const ModalStateContext = createContext<State>(initialState);
ModalStateContext.displayName = 'ModalStateContext';

const ModalActionContext = createContext<
  React.Dispatch<Action> | undefined
>(undefined);
ModalActionContext.displayName = 'ModalActionContext';

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(modalReducer, initialState);
  return (
    <ModalStateContext.Provider value={state}>
      <ModalActionContext.Provider value={dispatch}>
        {children}
      </ModalActionContext.Provider>
    </ModalStateContext.Provider>
  );
};

export function useModalState() {
  const context = useContext(ModalStateContext);
  if (context === undefined) {
    throw new Error(`useModalState must be used within a ModalProvider`);
  }
  return context;
}

export function useModalAction() {
  const dispatch = useContext(ModalActionContext);
  if (dispatch === undefined) {
    throw new Error(`useModalAction must be used within a ModalProvider`);
  }
  return {
    openModal(view?: MODAL_VIEWS, payload?: unknown) {
      dispatch({ type: 'open', view, payload });
    },
    closeModal() {
      dispatch({ type: 'close' });
    },
  };
}
