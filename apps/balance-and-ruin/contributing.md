This is the front end to the Worlds Collide website. It is a Next.js app.
The other readmes talk about setting up the develop environment. This one is going to
talk about the code structure and where to put different options.

=Top Level Pages=
Adding one of these should be very rare. But they are in the `pages` folder.
There isn't much of a format for this. Just add your page to the folder and a reference to it
from the index page

=Tabs at the top of the create page=
These are in the `page-components` folder. Adding new ones shouldn't happen often but you can follow an example.
They will be referenced from the `create` page. This is where you will want to add a new card to one of the tabs

=Cards=
These are each of the "cards" you see on the page. These are found in `card-components`. If your component needs
state other than basic storing the flag and the argument to it.

=Buttons etc.=
Buttons, sliders, lists, etc. live in `components` each in their own folder under it.
These will be referenced from the `card-components` element. And will have their own state potentially

=Data types=
If you need new types they go in the `types` folder and will get used in all the other files dealing with
the new type.

=State=
If you need to store new state across the page that is stored in the AppState in what are known as slices.
The slices are defined in the `state` folder and referenced in `store.ts`. Any other services that need to be called
or state loaded should happen in `create.tsx`
