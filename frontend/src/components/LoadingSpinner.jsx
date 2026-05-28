const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  const spinner = (
    <div className={`animate-spin rounded-full border-2 border-vista-200 border-t-vista-600 ${sizes[size]}`} />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    );
  }
  return <div className="flex justify-center p-8">{spinner}</div>;
};

export default LoadingSpinner;
