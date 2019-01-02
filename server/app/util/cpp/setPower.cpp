#include <node.h>
#include "visa.h"

using namespace v8;

void setPower(const FunctionCallbackInfo<Value> &args)
{
    Isolate *isolate = args.GetIsolate();
    double frequency = args[0].As<Number>()->Value();
    double power = args[1].As<Number>()->Value();

    //* C++ starts here

    ViSession defaultRM, viMXG;
    ViStatus viStatus = 0;

    viStatus = viOpenDefaultRM(&defaultRM);
    viStatus = viOpen(defaultRM, "GPIB0::18::INSTR", VI_NULL, VI_NULL, &viMXG);

    if (viStatus)
        return;

    // Set frequency and power
    viPrintf(viMXG, "FREQ %fGHz\n", frequency);
    viPrintf(viMXG, "POW %fdBm\n", power);

    viClose(viMXG);     // closes session
    viClose(defaultRM); // closes default session

    //* C++ ends here
}

void init(Local<Object> exports, Local<Object> method)
{
    NODE_SET_METHOD(method, "exports", setPower);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);