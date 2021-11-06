// useDocumentTitle.js
import { useRef, useEffect } from 'react'

function useDocumentTitle(title: string, prevailOnUnmount = false, withPrefix = true) {
  const defaultTitle = useRef(document.title);
  const titlePrefix = 'TokenRage |'

  useEffect(() => {
    document.title = withPrefix ? `${titlePrefix} ${title}` : title;
  }, [title, withPrefix]);

  useEffect(() => () => {
    if (!prevailOnUnmount) {
      document.title = defaultTitle.current;
    }
  }, [])
}

export default useDocumentTitle