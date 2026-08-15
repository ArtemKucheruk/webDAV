/** bare on purpose, the id and email land here once /user/me returns them */
export function Account() {
  // covers the canvas rather than unmounting it, the webgl context has to survive routing
  return <div className="relative z-10 min-h-svh bg-ground" />
}
