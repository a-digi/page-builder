# How to add a custom component in the PageBuilder

```
// path: src/pages/MyEditorPage.tsx

import React, { useRef } from 'react';
import PageBuilder, { type PageBuilderHandle, type Data } from '../path/to/PageBuilder';
import { videoBlockDefinition } from '../components/custom/videoBlockDefinition';
import type { BuiltInComponents } from '../path/to/pageBuilder/types/components';
import type { VideoComponent } from '../app-types';

// This is the CRITICAL part: create a union type of all components you will use.
type MyPageComponents = BuiltInComponents | VideoComponent;

const MyEditorPage = () => {
  // Pass the union type to the ref and state
  const builderRef = useRef<PageBuilderHandle<MyPageComponents>>(null);
  const [initialData, setInitialData] = React.useState<Data<MyPageComponents>>({
    components: [],
  });

  const handleSave = (json: string) => {
    console.log("Saving data:", json);
  };
  
  return (
    <PageBuilder<MyPageComponents>
      ref={builderRef}
      data={initialData}
      onSave={handleSave}
      additionalComponents={[videoBlockDefinition]} // Pass the definition here
      excludedComponents={['html']} // Example of excluding a built-in one
      displaySaveButton={true}
      saveButtonClickable={true}
    />
  )
}
```
