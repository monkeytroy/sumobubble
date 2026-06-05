/**
 * Module only interface for props
 */
interface IAppScriptProps {
  site: string;
  preview?: boolean;
}

export default function AppScript(props: IAppScriptProps) {
  return (
    <>
      <script type="module" src={process.env.NEXT_PUBLIC_SCRIPT_URL} id="sumobubble-scriptastic" async></script>
      <sumobubble-wc site={props.site} preview={props.preview}></sumobubble-wc>
    </>
  );
}
