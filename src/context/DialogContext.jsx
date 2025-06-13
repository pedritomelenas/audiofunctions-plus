// DialogContext.js
import React, { createContext, useContext, useState } from "react";
import EditFunctionDialog from "../components/ui/dialogs/EditFunctionDialog";
import ChangeGraphBoundDialog from "../components/ui/dialogs/ChangeGraphBoundDialog";
import ShowHideFunctionsDialog from "../components/ui/dialogs/ShowHideFunctionsDialog";

const DialogContext = createContext();

export const useDialog = () => useContext(DialogContext);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState({ type: null, props: {} });

  const openDialog = (type, props = {}) => setDialog({ type, props });
  const closeDialog = () => setDialog({ type: null, props: {} });

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}

      <EditFunctionDialog
        isOpen={dialog.type === "edit-function"}
        onClose={closeDialog}
        {...dialog.props}
      />
      
      <ChangeGraphBoundDialog
        isOpen={dialog.type === "change-graph-bound"}
        onClose={closeDialog}
        {...dialog.props}
      />

      <ShowHideFunctionsDialog
        isOpen={dialog.type === "showHide-functions"}
        onClose={closeDialog}
        {...dialog.props}
      />
    </DialogContext.Provider>
  );
}
