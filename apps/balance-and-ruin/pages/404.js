import { useState, useEffect } from "react"
import { Link } from "@ff6wc/ui"

export default function Custom404() {
  const [redirectPath, setRedirectPath] = useState("")
  const SEED = "seed"

  useEffect( () => {
    // Seed of the Week has been retired; redirect any legacy /sotw traffic to home.
    // public/_redirects handles this at the edge with a real 301 -- this is the fallback.
    const path = window.location.pathname
    if (path === '/sotw' || path.startsWith('/sotw/')) {
      setRedirectPath('/')
      window.location.replace('/')
      return
    }

    const url = window.location.href.split('/')
    //remove the trailing slash (replaced by an empty string with the split) if it exists
    const maybeEmpty = url.pop(); 
    if(maybeEmpty) { 
      //it's not an empty string -- readd it
      url.push(maybeEmpty)
    }
    const lastParam=url.pop();
    const secondToLastParam =url.pop();

    // seed was changed to accept an id param -- this logic will redirect users to the new URL
    if(secondToLastParam == SEED) {
      const newLastPart = `?id=${lastParam}`
      // now redirect -- reform the URL with our correct path
      url.push(secondToLastParam)
      url.push(newLastPart)
      var newPath = url.join('/')
      console.log(newPath)

      setRedirectPath(newPath)

      window.location.replace(newPath)
    }
  }, [])
  
  if(redirectPath) {
    return ( <Link href = {redirectPath}>Please use the new path: {redirectPath}</Link> )
  } else {
    return ( <p> 404 error -- Unknown path </p>)
  }

}