// DialogContext.js
import React, { createContext, useContext, useState } from "react";
import ExampleDialog from "../components/ui/dialogs/EditFunctionDialog";

const DialogContext = createContext();

export const useDialog = () => useContext(DialogContext);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState({ type: null, props: {} });

  const openDialog = (type, props = {}) => setDialog({ type, props });
  const closeDialog = () => setDialog({ type: null, props: {} });

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}

      <ExampleDialog
        isOpen={dialog.type === "edit-function"}
        onClose={closeDialog}
        {...dialog.props}
      />
    </DialogContext.Provider>
  );
}
